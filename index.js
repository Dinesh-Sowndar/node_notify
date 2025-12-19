const express = require("express");
const cors = require("cors");
const admin = require("./firebase");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/**
 * POST /send-notification
 * Body:
 * {
 *   "token": "FCM_DEVICE_TOKEN",
 *   "title": "New Message",
 *   "body": "Hello 👋",
 *   "data": {
 *     "type": "chat",
 *     "chatId": 123
 *   }
 * }
 */
app.post("/send-notification", async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token) {
    return res.status(400).json({ error: "FCM token required" });
  }

  // Convert data values to STRING (FCM requirement)
  const stringData = {
    click_action: "FLUTTER_NOTIFICATION_CLICK",
    ...(data
      ? Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        )
      : {}),
  };

  const message = {
    token,
    notification: {
      title: title || "Notification",
      body: body || "",
    },
    data: stringData,
    android: {
      priority: "high",
      notification: {
        clickAction: "FLUTTER_NOTIFICATION_CLICK",
        channelId: "default_channel",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    res.json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error("FCM Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 FCM server running on http://localhost:${PORT}`);
});
