import random
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from events.enums.events import EventCity, EventStatus, EventType
from events.models.events import Event, EventComments, EventInvitedUsers, EventLikes, EventMembers
from notifications.enums.notifications import NotificationType
from notifications.services.notifications import NotificationsService
from users.models.user import User


async def create_events_fixtures(session: AsyncSession, users: list[User]) -> list[Event]:
    """Создает тестовые события для разработки"""
    
    if not users:
        return []
    
    # Находим админа для создания событий
    admin = next((u for u in users if u.role.value == "admin"), users[0])
    regular_users = [u for u in users if u.role.value == "user"]
    
    today = date.today()
    
    # Базовые шаблоны событий
    event_templates = [
        {
            "names": ["День рождения в парке", "Празднование дня рождения", "День рождения на природе", "Торжество в честь дня рождения"],
            "short_descriptions": ["Отмечаем день рождения на свежем воздухе в парке", "Празднуем вместе с друзьями и близкими людьми", "Веселое торжество с музыкой и угощениями для всех", "День рождения с друзьями в уютной атмосфере праздника"],
            "descriptions": [
                "Приглашаем всех на празднование дня рождения в центральном парке. Будет музыка, угощения и хорошее настроение!",
                "Большое празднование дня рождения с друзьями и близкими. Ждем всех!",
                "Торжественное мероприятие в честь дня рождения. Развлечения и угощения для всех гостей.",
            ],
            "type": EventType.BIRTHDAY,
            "cities": [EventCity.MOSCOW, EventCity.ST_PETERSBURG, EventCity.KAZAN, EventCity.NOVOSIBIRSK],
            "locations": ["Центральный парк", "Ресторан", "Кафе", "Парк культуры"],
            "max_members_range": (20, 50),
            "days_range": (1, 30),
        },
        {
            "names": ["Техническая конференция", "IT-конференция", "Конференция разработчиков", "Технологический форум"],
            "short_descriptions": ["Конференция для разработчиков с докладами о технологиях", "IT-мероприятие с участием ведущих специалистов индустрии", "Технический форум для обмена опытом между профессионалами", "Конференция по программированию с презентациями и воркшопами"],
            "descriptions": [
                "Ежегодная конференция для разработчиков. Доклады о новых технологиях, лучших практиках и кейсах из индустрии.",
                "Масштабная IT-конференция с участием ведущих специалистов индустрии.",
                "Форум для обмена опытом между разработчиками. Презентации, воркшопы и нетворкинг.",
            ],
            "type": EventType.CONFERENCE,
            "cities": [EventCity.MOSCOW, EventCity.ST_PETERSBURG, EventCity.YEKATERINBURG, EventCity.NOVOSIBIRSK],
            "locations": ["Конференц-центр", "Бизнес-центр", "Отель", "Выставочный центр"],
            "max_members_range": (100, 500),
            "days_range": (5, 60),
            "duration": (2, 3),
        },
        {
            "names": ["Мастер-класс по кулинарии", "Кулинарный мастер-класс", "Уроки готовки", "Кулинарная школа"],
            "short_descriptions": ["Учимся готовить изысканные блюда от профессиональных поваров", "Кулинарные уроки с практическими занятиями и дегустациями", "Мастер-класс от шеф-повара по приготовлению блюд итальянской кухни", "Изучаем кухню различных стран мира на практических занятиях"],
            "descriptions": [
                "Практический мастер-класс по приготовлению блюд итальянской кухни. Все ингредиенты включены.",
                "Увлекательный мастер-класс по приготовлению блюд различных кухонь мира.",
                "Профессиональный урок от опытного шеф-повара. Научимся готовить изысканные блюда.",
            ],
            "type": EventType.WORKSHOP,
            "cities": [EventCity.MOSCOW, EventCity.ST_PETERSBURG, EventCity.KRASNODAR, EventCity.KAZAN],
            "locations": ["Кулинарная студия", "Ресторан", "Кулинарная школа", "Кафе"],
            "max_members_range": (10, 25),
            "days_range": (3, 20),
        },
        {
            "names": ["Вечеринка в клубе", "Танцевальная вечеринка", "Ночная вечеринка", "Клубная вечеринка"],
            "short_descriptions": ["Танцевальная вечеринка с диджеями и живой музыкой в клубе", "Ночной клуб с лучшими диджеями города и отличной атмосферой", "Танцы до утра под живую музыку в стильном заведении", "Музыкальная вечеринка с яркими выступлениями и незабываемыми эмоциями"],
            "descriptions": [
                "Большая танцевальная вечеринка с диджеями и живой музыкой. Dress code: casual.",
                "Незабываемая ночная вечеринка с лучшими диджеями города.",
                "Танцевальная вечеринка в стильном клубе. Живая музыка и отличная атмосфера.",
            ],
            "type": EventType.PARTY,
            "cities": [EventCity.MOSCOW, EventCity.ST_PETERSBURG, EventCity.KAZAN, EventCity.ROSTOV_ON_DON],
            "locations": ["Ночной клуб", "Клуб", "Бар", "Лофт"],
            "max_members_range": (100, 300),
            "days_range": (1, 14),
        },
        {
            "names": ["Встреча выпускников", "Встреча однокурсников", "Встреча друзей", "Встреча коллег"],
            "short_descriptions": ["Встреча однокурсников для общения и воспоминаний о студенческих годах", "Встреча друзей в теплой атмосфере с общением и развлечениями", "Воссоединение выпускников для обмена новостями и новыми знакомствами", "Встреча выпускников университета с воспоминаниями и планами на будущее"],
            "descriptions": [
                "Ежегодная встреча выпускников университета. Вспоминаем студенческие годы и общаемся.",
                "Теплая встреча старых друзей и однокурсников. Вспоминаем лучшие моменты.",
                "Воссоединение выпускников. Общение, воспоминания и новые знакомства.",
            ],
            "type": EventType.MEETING,
            "cities": [EventCity.MOSCOW, EventCity.ST_PETERSBURG, EventCity.NOVOSIBIRSK, EventCity.YEKATERINBURG],
            "locations": ["Ресторан", "Кафе", "Парк", "Клуб"],
            "max_members_range": (30, 80),
            "days_range": (7, 45),
        },
        {
            "names": ["Тренинг по личностному росту", "Личностный тренинг", "Тренинг развития", "Тренинг саморазвития"],
            "short_descriptions": ["Развиваем лидерские качества и навыки коммуникации на практических тренингах", "Личностный рост через интенсивные занятия и практические упражнения", "Саморазвитие с помощью профессиональных тренеров и современных методик", "Развитие навыков soft skills и лидерских компетенций в команде"],
            "descriptions": [
                "Интенсивный тренинг по развитию лидерских качеств и навыков коммуникации. Практические упражнения и кейсы.",
                "Тренинг для тех, кто хочет развиваться и достигать новых высот в жизни и карьере.",
                "Практический тренинг по развитию soft skills и лидерских компетенций.",
            ],
            "type": EventType.TRAINING,
            "cities": [EventCity.MOSCOW, EventCity.ST_PETERSBURG, EventCity.YEKATERINBURG, EventCity.KRASNODAR],
            "locations": ["Бизнес-центр", "Офис", "Тренинг-центр", "Коворкинг"],
            "max_members_range": (15, 40),
            "days_range": (10, 60),
            "duration": (1, 3),
        },
        {
            "names": ["Рок-концерт", "Живой концерт", "Музыкальный концерт", "Концерт группы"],
            "short_descriptions": ["Живая музыка от популярных рок-групп с яркими выступлениями", "Рок-музыка в исполнении известных музыкантов с незабываемыми эмоциями", "Концерт с участием нескольких групп и невероятной энергетикой", "Музыкальное шоу с профессиональными артистами и драйвовой атмосферой"],
            "descriptions": [
                "Концерт популярных рок-групп. Яркое шоу и незабываемые эмоции!",
                "Живой концерт с участием известных музыкантов. Незабываемое музыкальное событие.",
                "Большой концерт с участием нескольких групп. Энергия и драйв гарантированы!",
            ],
            "type": EventType.CONCERT,
            "cities": [EventCity.MOSCOW, EventCity.ST_PETERSBURG, EventCity.KAZAN, EventCity.NOVOSIBIRSK],
            "locations": ["Концертный зал", "Стадион", "Площадь", "Клуб"],
            "max_members_range": (200, 1000),
            "days_range": (1, 30),
        },
        {
            "names": ["Фестиваль еды", "Гастрономический фестиваль", "Фестиваль кулинарии", "Фуд-фестиваль"],
            "short_descriptions": ["Гастрономический фестиваль с участием лучших ресторанов и поваров города", "Фестиваль еды с дегустациями различных блюд и кулинарными мастер-классами", "Кулинарный фестиваль для всех любителей вкусной еды и развлечений", "Фуд-фест с конкурсами и развлечениями для всей семьи и друзей"],
            "descriptions": [
                "Большой фестиваль еды с участием лучших ресторанов города. Дегустации, мастер-классы и конкурсы.",
                "Масштабный гастрономический фестиваль. Лучшие повара и рестораны города.",
                "Фестиваль для всех любителей вкусной еды. Дегустации, конкурсы и развлечения.",
            ],
            "type": EventType.FESTIVAL,
            "cities": [EventCity.MOSCOW, EventCity.ST_PETERSBURG, EventCity.KRASNODAR, EventCity.KAZAN],
            "locations": ["Площадь", "Парк", "Набережная", "Выставочный центр"],
            "max_members_range": (500, 2000),
            "days_range": (15, 90),
        },
        {
            "names": ["Экскурсия по историческим местам", "Пешеходная экскурсия", "Обзорная экскурсия", "Историческая экскурсия"],
            "short_descriptions": ["Пешеходная экскурсия по историческим местам города с профессиональным гидом", "Исторические места города с увлекательными рассказами и интересными фактами", "Обзорная экскурсия с посещением главных достопримечательностей и памятников", "Познавательная прогулка по самым интересным и красивым местам города"],
            "descriptions": [
                "Увлекательная пешеходная экскурсия по историческим местам города с профессиональным гидом.",
                "Познавательная экскурсия по самым интересным местам города.",
                "Обзорная экскурсия с посещением главных достопримечательностей.",
            ],
            "type": EventType.EXCURSION,
            "cities": [EventCity.MOSCOW, EventCity.ST_PETERSBURG, EventCity.KAZAN, EventCity.NOVOSIBIRSK],
            "locations": ["Сбор у метро", "Центр города", "Площадь", "Музей"],
            "max_members_range": (15, 30),
            "days_range": (2, 20),
        },
        {
            "names": ["Семинар по инвестициям", "Финансовый семинар", "Семинар по финансам", "Инвестиционный семинар"],
            "short_descriptions": ["Финансовое планирование для начинающих и опытных инвесторов на практике", "Инвестиции и основы приумножения капитала с реальными кейсами", "Финансы и управление личным бюджетом с практическими советами", "Управление капиталом и инвестирование для достижения финансовых целей"],
            "descriptions": [
                "Практический семинар по основам инвестирования и финансового планирования. Для начинающих и опытных инвесторов.",
                "Семинар о том, как правильно распоряжаться финансами и приумножать капитал.",
                "Образовательный семинар по инвестициям и финансовой грамотности.",
            ],
            "type": EventType.SEMINAR,
            "cities": [EventCity.MOSCOW, EventCity.ST_PETERSBURG, EventCity.YEKATERINBURG, EventCity.KRASNODAR],
            "locations": ["Офис", "Бизнес-центр", "Конференц-зал", "Коворкинг"],
            "max_members_range": (25, 60),
            "days_range": (5, 40),
        },
        {
            "names": ["Тур по Золотому кольцу", "Экскурсионный тур", "Туристический тур", "Познавательный тур"],
            "short_descriptions": ["Многодневный тур по историческим городам с экскурсиями и проживанием", "Экскурсионный тур с посещением самых интересных достопримечательностей региона", "Туристический маршрут по красивым местам с профессиональными гидами и комфортом", "Путешествие по историческим городам России с незабываемыми впечатлениями"],
            "descriptions": [
                "Трехдневный тур по городам Золотого кольца России. Посещение исторических достопримечательностей, экскурсии и проживание.",
                "Увлекательное путешествие по историческим городам России.",
                "Туристический тур с посещением самых интересных мест региона.",
            ],
            "type": EventType.TOUR,
            "cities": [EventCity.RYAZAN, EventCity.MOSCOW, EventCity.ST_PETERSBURG, EventCity.KAZAN],
            "locations": ["Сбор у вокзала", "Туристическое агентство", "Отель", "Центр города"],
            "max_members_range": (20, 50),
            "days_range": (10, 90),
            "duration": (2, 5),
        },
    ]
    
    events_data = []
    
    # Создаем 50 событий
    for i in range(50):
        template = random.choice(event_templates)
        name = random.choice(template["names"])
        short_desc = random.choice(template["short_descriptions"])
        desc = random.choice(template["descriptions"])
        city = random.choice(template["cities"])
        location = random.choice(template["locations"])
        
        # Уникализируем название
        if i > 0:
            name = f"{name} #{i+1}"
        
        days_offset = random.randint(*template["days_range"])
        start_date = today + timedelta(days=days_offset)
        
        # Определяем длительность события
        if "duration" in template:
            duration = random.randint(*template["duration"])
        else:
            duration = 1
        
        end_date = start_date + timedelta(days=duration - 1)
        
        # Определяем статус
        if start_date <= today:
            status = EventStatus.ACTIVE
        elif days_offset > 30:
            status = EventStatus.COMING_SOON
        else:
            status = random.choice([EventStatus.COMING_SOON, EventStatus.ACTIVE])
        
        # Некоторые события завершены
        if i < 5:
            start_date = today - timedelta(days=random.randint(5, 30))
            end_date = start_date + timedelta(days=duration - 1)
            status = EventStatus.COMPLETED
        
        max_members = random.randint(*template["max_members_range"])
        
        # Случайные приглашенные пользователи
        num_invited = random.randint(2, min(8, len(regular_users)))
        invited_indices = random.sample(range(len(regular_users)), num_invited)
        
        pay_data = None
        if random.random() > 0.3:  # 70% событий платные
            prices = [500, 1000, 1500, 2000, 3000, 5000, 8000, 10000, 15000]
            price = random.choice(prices)
            pay_data = f"Стоимость: {price} руб."
        
        image_urls = [
            "images/image1.png",
            "images/image2.png",
            "images/image3.png",
            "images/image4.png",
            "images/image5.png",
            "images/image6.png",
            "images/image7.png",
            "images/image8.png",
            "images/image9.png",
            "images/image10.png",
        ]
        
        image_url = random.choice(image_urls)

        events_data.append({
            "name": name,
            "short_description": short_desc,
            "description": desc,
            "start_date": start_date,
            "end_date": end_date,
            "city": city,
            "location": f"{location}, {city.value}",
            "type": template["type"],
            "status": status,
            "max_members": max_members,
            "image_url": image_url,
            "pay_data": pay_data,
            "invited_user_indices": invited_indices,
        })
    
    events = []
    for event_data in events_data:
        # Проверяем, существует ли событие
        result = await session.execute(
            select(Event).where(Event.name == event_data["name"])
        )
        existing_event = result.scalar_one_or_none()
        
        if existing_event:
            events.append(existing_event)
            continue
        
        # Создаем новое событие
        event = Event(
            name=event_data["name"],
            short_description=event_data["short_description"],
            description=event_data["description"],
            start_date=event_data["start_date"],
            end_date=event_data["end_date"],
            city=event_data["city"],
            location=event_data["location"],
            type=event_data["type"],
            status=event_data["status"],
            max_members=event_data["max_members"],
            image_url=event_data["image_url"],
            pay_data=event_data["pay_data"],
        )
        session.add(event)
        await session.commit()
        await session.refresh(event)
        
        # Добавляем приглашенных пользователей (только если событие новое)
        invited_indices = event_data.get("invited_user_indices", [])
        for idx in invited_indices:
            if idx < len(regular_users):
                # Проверяем, не добавлен ли уже этот пользователь
                check_result = await session.execute(
                    select(EventInvitedUsers).where(
                        EventInvitedUsers.event_id == event.id,
                        EventInvitedUsers.user_id == regular_users[idx].id
                    )
                )
                if not check_result.scalar_one_or_none():
                    invited_user = EventInvitedUsers(
                        event_id=event.id,
                        user_id=regular_users[idx].id
                    )
                    session.add(invited_user)
                
                    await NotificationsService.create_notification(
                        session=session,
                        user_id=regular_users[idx].id,
                        event_id=event.id,
                        type=NotificationType.EVENT_CREATED
                    )
        
        # Некоторые пользователи присоединяются к событиям
        if len(regular_users) > 0 and random.random() > 0.3:  # 70% событий имеют участников
            num_members = random.randint(1, min(5, len(invited_indices)))
            selected_indices = random.sample(invited_indices, num_members)
            for idx in selected_indices:
                if idx < len(regular_users):
                    # Проверяем, не присоединился ли уже этот пользователь
                    check_result = await session.execute(
                        select(EventMembers).where(
                            EventMembers.event_id == event.id,
                            EventMembers.user_id == regular_users[idx].id
                        )
                    )
                    if not check_result.scalar_one_or_none():
                        member = EventMembers(
                            event_id=event.id,
                            user_id=regular_users[idx].id
                        )
                        session.add(member)
        
        # Некоторые пользователи лайкают события
        if len(regular_users) > 0 and random.random() > 0.4:  # 60% событий имеют лайки
            num_likes = random.randint(1, min(4, len(invited_indices)))
            selected_indices = random.sample(invited_indices, num_likes)
            for idx in selected_indices:
                if idx < len(regular_users):
                    # Проверяем, не лайкнул ли уже этот пользователь
                    check_result = await session.execute(
                        select(EventLikes).where(
                            EventLikes.event_id == event.id,
                            EventLikes.user_id == regular_users[idx].id
                        )
                    )
                    if not check_result.scalar_one_or_none():
                        like = EventLikes(
                            event_id=event.id,
                            user_id=regular_users[idx].id
                        )
                        session.add(like)
        
        await session.commit()
        events.append(event)
    
    return events
