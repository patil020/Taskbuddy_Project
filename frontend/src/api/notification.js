import api from "../lib/axios";

export function getUnreadNotifications(userId) {
  if (!userId) {
    return api.get("/notifications/unread");
  }
  return api.get(`/notifications/user/${userId}/unread`);
}

export function markNotificationAsRead(notificationId) {
  return api.put(`/notifications/${notificationId}/read`);
}

export function sendNotification(data) {
  return api.post("/notifications", data);
}
