const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // ตรวจสอบว่าผู้เรียกใช้เป็น Admin อยู่แล้วหรือไม่
  // นี่เป็นมาตรการความปลอดภัยสำหรับอนาคต
  if (context.auth.token.admin !== true) {
    return {
      error: "Request not authorized. " +
             "User must be an admin to fulfill this request.",
    };
  }

  const email = data.email;
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, {admin: true});
    return {
      message: `Success! ${email} has been made an admin.`,
    };
  } catch (err) {
    console.error(err);
    return {error: err.message};
  }
});
