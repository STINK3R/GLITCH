from enum import Enum


class EventStatus(Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class EventCity(Enum):
    MOSCOW = "Москва"
    ST_PETERSBURG = "Санкт-Петербург"
    NOVOSIBIRSK = "Новосибирск"
    YEKATERINBURG = "Екатеринбург"
    KRASNODAR = "Краснодар"
    SAMARA = "Самара"
    UFA = "Уфа"
    VOLGOGRAD = "Волгоград"
    KAZAN = "Казань"
    RYAZAN = "Рязань"
    SARATOV = "Саратов"
    TOLYATTI = "Тольятти"
    ROSTOV_ON_DON = "Ростов-на-Дону"
    MINSK = "Минск"
    GOMEL = "Гомель"
    BREST = "Брест"
    VITEBSK = "Витебск"
    GRODNO = "Гродно"
    MOGILEV = "Могилев"
