from enum import Enum

class NotificationType(Enum):
    EVENT_CREATED = "event_created" 
    EVENT_UPDATED = "event_updated"
    EVENT_REVIEW = "event_review"
    EVENT_CANCELLED = "event_cancelled"
    EVENT_REMINDER_24H = "event_reminder_24h"