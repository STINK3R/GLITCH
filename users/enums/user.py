from enum import Enum


class UserRole(Enum):
    USER = "user"
    ADMIN = "admin"


class UserStatus(Enum):
    ACTIVE = "active"
    BLOCKED = "blocked"
    DELETED = "deleted"
