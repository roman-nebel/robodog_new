require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
var Airtable = require('airtable');
const cron = require('cron')
var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
var logStdout = process.stdout;

console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
}
console.error = console.log;

Airtable.configure({
    endpointUrl: process.env.AIRTABLE_URL,
    apiKey: process.env.AIRTABLE_KEY
});

// Настройка переменных и запуск бота
// TO-DO: Возможно, базы тоже в .env
var base = Airtable.base('appRHSt1mSRFMkQqr');
var userbase = Airtable.base('appbFefLKBFlLFL7F');

const bot = new TelegramBot(process.env.TELEGRAM_KEY, {polling: true});

let users = {};
let cases = [];
let articles = [];
const resultsPerPage = 5
const keyboards = {
    main: [
        [
          { text: 'Кейсы' }
        ],
        [
          { text: 'Статьи' }
        ],
        [
          { text: 'Книги' }
        ],
        [
          { text: 'Собака в соц. сетях' }
        ]
    ],
    cases: [
        [
          {
            text: '20 лучших кейсов',
            callback_data: 'isBest'
          }
        ],
        [
            {
              text: '5 свежих кейсов',
              callback_data: 'isRecent'
            }
        ],
        [
            {
              text: 'Популярные кейсы',
              callback_data: 'isPopular'
            }
        ],
        [
            {
              text: 'Подборки по 9 годам',
              callback_data: 'byYear'
            }
        ],
        [
            {
              text: 'Подборки по 13 отраслям',
              callback_data: 'byBranch'
            }
        ]
    ],
    articles: [
        [
            {
                text: 'Популярные статьи',
                callback_data: 'isPopular'
            }
        ],
        [
            {
                text: 'Подборки по 9 годам',
                callback_data: 'byYear'
            }
        ],
        [
            {
                text: 'Подборки по 6 тематикам',
                callback_data: 'byTheme'
            }
        ],
        [
            {
                text: 'Подборки по 5 форматам',
                callback_data: 'byFormat'
            }
        ]
    ],
    byYear: [
    [
        {
            text: '2012',
            callback_data: '2012'
        },
        {
            text: '2013',
            callback_data: '2013'
        },
        {
            text: '2014',
            callback_data: '2014'
        }
    ],
    [
        {
            text: '2015',
            callback_data: '2015'
        },
        {
            text: '2016',
            callback_data: '2016'
        },
        {
            text: '2017',
            callback_data: '2017'
        }
    ],
    [
        {
            text: '2018',
            callback_data: '2018'
        },
        {
            text: '2019',
            callback_data: '2019'
        },
        {
            text: '2020',
            callback_data: '2020'
        }
    ],
    [
        {
            text: '2021',
            callback_data: '2021'
        }
    ]
    ],
    byBranch: [
        [
            {
                text: 'B2B-стартапы и продукты',
                callback_data: 'E-commerce'
            }
            ],
            [
                {
                    text: 'CRM, ARM и документооборот',
                    callback_data: 'CRM, ARM и документооборот'
                }
                ],
        [
        {
            text: 'E-commerce',
            callback_data: 'E-commerce'
        }
        ],
        [
            {
            text: 'IT и телеком',
            callback_data: 'IT и телеком'
            }
        ],
        [
            {
            text: 'Госсектор',
            callback_data: 'Госсектор'
            }
        ],
        [
            {
            text: 'Логистика и туризм',
            callback_data: 'Логистика и туризм'
            }
        ],
        [
            {
            text: 'Медиа и образование',
            callback_data: 'Медиа и образование'
            }
        ],
        [
            {
            text: 'Медицина',
            callback_data: 'Медицина'
            }
        ],
        [
            {
            text: 'Недвижимость',
            callback_data: 'Недвижимость'
            }
        ],
        [
            {
            text: 'Промышленность',
            callback_data: 'Промышленность'
            }
        ],
        [
            {
            text: 'Страхование',
            callback_data: 'Страхование'
            }
        ],
        [
            {
            text: 'Финансы',
            callback_data: 'Финансы'
            }
        ],
        [
            {
            text: 'Безопасность',
            callback_data: 'Безопасность'
            }
        ]
    ],
    byTheme: [
        [
            {
                text: 'Интерфейсы',
                callback_data: 'Интерфейсы'
            }
            ],
            [
                {
                    text: 'Исследования',
                    callback_data: 'Исследования'
                }
                ],
        [
        {
            text: 'Бизнес',
            callback_data: 'Бизнес'
        }
        ],
        [
            {
            text: 'Тексты',
            callback_data: 'Тексты'
            }
        ],
        [
            {
            text: 'Технологии',
            callback_data: 'Технологии'
            }
        ],
        [
            {
            text: 'Менеджмент',
            callback_data: 'Менеджмент'
            }
        ]
    ],
    byFormat: [
    [
        {
            text: 'Лонгрид',
            callback_data: 'Лонгрид'
        }
        ],
        [
            {
            text: 'Список',
            callback_data: 'Список'
            }
        ],
        [
            {
            text: 'Инструкция',
            callback_data: 'Инструкция'
            }
        ],
        [
            {
            text: 'Всепеределать',
            callback_data: 'Всепеределать'
            }
        ],
        [
            {
            text: 'Разбор',
            callback_data: 'Разбор'
            }
        ]
    ],
    social: [
        [
            {
                text: 'Telegram',
                url: 'https://t.me/pavlova_cc'
            }
            ],
            [
                {
                    text: 'Facebook',
                    url: 'https://www.facebook.com/PavlovaPage'
                }
            ],
            [
                {
                    text: 'Instagram',
                    url: 'https://www.instagram.com/sobakapav/'
                }
                ],
        [
            {
            text: 'ВКонтакте',
            url: 'https://vk.com/sobakapavlovaltd'
            }
        ],
        [
            {
            text: 'Twitter',
            url: 'https://twitter.com/sobakapav'
            }
        ],
        [
            {
            text: 'Youtube',
            url: 'https://www.youtube.com/playlist?list=PLimfCvKK4fIqcTuyyCsFMwQxOFXxAah1H&disable_polymer=true'
            }
        ]
    ],
    more: [
    [
        {
        text: 'Показать еще',
        callback_data: 'showMore'
        }
    ]
    ],
    empty: [[{}]]
}

// TO-DO: не надо так
let books = `А вот и книги! Все — в формате ePub.

1. Как решать UX-задачи в ситуации незнания и самообмана (RU)
https://drive.google.com/open?id=1Te3KM3XhPocuVX8ocPLMzX_go4tfhX9r

Як вирішувати UX-задачі в ситуації необізнаності та самообману (UA)
https://drive.google.com/open?id=1MELAfG9tNVzf-zWxHB-tkMGU70ArIjuy

2. Нет слов. Кое-что о копирайтинге (RU)
https://drive.google.com/open?id=1Zmeb7z3C9AUmpeE3DgisvyhZWZOAI2QC

3. Подводные грабли интернет-проектов (RU)
https://drive.google.com/open?id=1VjM79BrdIKcYkifBpMzIFfEnnzTTh2aB`;

// Функция подгружает в бота кейсы из базы Airtable 
// при старте и каждый день в полночь
function UpdateCases () {
    console.log(new Date().toLocaleString('ru-RU') + ' — Updating cases...')
    base('Кейсы').select({
      view: 'Grid view'
  }).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record, i) {
        var isBest
        var isRecent
        if (record.get('Крутой?') == undefined) {
          isBest = false
        } else { isBest = true };
        if (record.get('Свежий?') == undefined) {
          isRecent = false
        } else { isRecent = true }
        var oneCase = {
          id: i,
          title: record.get('Заголовок'),
          url: record.get('Ссылка'),
          year: record.get('Год окончания'),
          branch: record.get('Отрасль'),
          product: record.get('Продукт'),
          views: record.get('Просмотры'),
          isBest: isBest,
          isRecent: isRecent
        };
        cases.push(oneCase);
      });

      fetchNextPage();

  }, function done(err) {
        console.log(new Date().toLocaleString('ru-RU') + ` — Cases is up-to-date. Total: ${cases.length}`)
      if (err) { console.error(err); return; }
  });
}

// Функция подгружает в бота статьи из базы Airtable 
// при старте и каждый день в полночь
function UpdateArticles () {
    console.log(new Date().toLocaleString('ru-RU') + ' — Updating articles...')
    base('Статьи').select({
        view: 'Grid view'
    }).eachPage(function page(records, fetchNextPage) {
        records.forEach(function(record, i) {
        var oneArticle = {
            id: i,
            title: record.get('Статьи'),
            url: record.get('Ссылка'),
            year: record.get('Год'),
            theme: record.get('Тема на сайте'),
            format: record.get('Формат'),
            views: record.get('Просмотры'),
        };
        articles.push(oneArticle);
        });

        fetchNextPage();

    }, function done(err) {
        console.log(new Date().toLocaleString('ru-RU') + ` — Articles is up-to-date. Total: ${articles.length}`)
        if (err) { console.error(err); return; }
    });

}

// Функция подгружает в бота список пользователей из базы Airtable 
// при старте и каждый день в полночь
function UpdateUsers () {
    console.log(new Date().toLocaleString('ru-RU') + ' — Download users...')
    userbase('Userbase').select({
    view: "Grid view"
}).eachPage(function page(records, fetchNextPage) {
    records.forEach(function(record) {
        users[record.get('UserID')] = {
          id: record.get('UserID'),
          username: record.get('Username'),
          firstName: record.get('First Name'),
          lastName: record.get('Last Name'),
          subscribedDate: record.get('Subscribe date'),
          airtableId: record.getId(),
          lastQuery: '',
          where: '',
          filter: '',
          data: [],
          count: 0
        }
    });

    fetchNextPage();

}, function done(err) {
    console.log(new Date().toLocaleString('ru-RU') + ` — Users were downloaded:`)
    console.log(users)
    if (err) { console.error(err); return; }
});
}

// Функция добавления пользователя в базы
// TO-DO: сделать проверку на наличие записей в Airtable
function addUser(msg) {
    console.log(new Date().toLocaleString('ru-RU') + ` — Adding a new user with id ${msg.from.id}`)
    // TO-DO: нужно добавление в логи
    var date = new Date().toDateString()
  
    userbase('Userbase').create({
      "UserID": msg.chat.id,
      "Username": msg.chat.username,
      "Subscribed": true,
      "Subscribe date": date,
      "First Name": msg.chat.first_name,
      "Last Name": msg.chat.last_name
    }, function(err, record) {
      if (err) {
        console.error(err);
        return;
      }
  
      users[msg.chat.id] = {
        id: msg.chat.id,
        username: msg.chat.username,
        firstName: msg.chat.first_name,
        lastName: msg.chat.last_name,
        subscribedDate: date,
        airtableId: record.getId(),
        lastQuery: '',
        where: '',
        filter: '',
        data: [],
        count: 0
      }
      console.log(new Date().toLocaleString('ru-RU') + ` — User was added:`)
      console.log(users[msg.chat.id])
    });
  }

// Отправляем нужные статьи из базы пользователю
function returnResult (msg) {

    var chatId = msg.from.id

    // Проверяем, по какой базе ищем: кейсы или статьи
    // Фильтруем выдачу и подгружаем ее в временный массив пользователя
    var localBase = (users[chatId].where == 'cases') ? cases : articles;
    if (!users[chatId].data[0]) {
        if (users[chatId].filter) {
            filter[users[chatId].filter](localBase, users[chatId], msg.data)
        } else {
            filter[msg.data](localBase, users[chatId])
        }
    }

    // Собираем сообщение
    let what = (users[chatId].where == 'cases') ? 'кейсы' : 'статьи'
    var phrases = {
        isBest: `Здесь собраны проекты, которыми мы особенно гордимся. По ним проще всего составить мнение о «Собаке Павловой». 

Сначала — самые популярные у читателей.`,
        isPopular: `Эти ${what} читатели любят особенно сильно.`,
        isRecent: `Иногда мы выпускаем кейсы по проектам двухлетней давности — долго ждали запуска продукта, согласования заказчика или чего-то еще. Если увидите такой, не смущайтесь — кейс свежий. 

Сначала — самые популярные у читателей.`
    }

    var result = users[chatId].data
    var message = (phrases[msg.data] && users[chatId].count == 0) ? phrases[msg.data] + '\n\n' :''
    result.forEach(function (res, i) {
        if (i >= users[chatId].count && i < users[chatId].count+resultsPerPage) {
            message += i+1 + '. ' + res.title + '\n' + res.url + '\n\n'
        }
    })
    let key = (result.length > users[chatId].count+resultsPerPage) ? {
        reply_markup: {
            inline_keyboard: keyboards.more
        },
        disable_web_page_preview: true
      } : {disable_web_page_preview: true}
    users[chatId].count += resultsPerPage

    // Отправляем сообщение
    // Если выдача пустая — сообщаем
    if (!message) {
        bot.sendMessage(chatId, "Кажется, тут мы ничего не нашли. Попробуйте поискать по другим критериям")
        users[msg.from.id].lastQuery = '';
    } else {
    bot.sendMessage(chatId, message, key).then(payload => {
        if ('reply_markup' in payload) {
        users[chatId].lastQuery = payload.message_id
        } else users[chatId].lastQuery = ''
    });
    console.log(new Date().toLocaleString('ru-RU') + ` — Message was send to user ${msg.from.id}`);
}
}

// Сброс кешированных записей о поиске в БД конкретного пользователя (при новом поиске)
function Restore (chatId) {
    users[chatId].where = ''
    users[chatId].filter = ''
    users[chatId].data = []
    users[chatId].count = 0
    if (users[chatId].lastQuery) {
        bot.editMessageReplyMarkup({}, {
            chat_id: chatId,
            message_id: users[chatId].lastQuery
        });
        users[chatId].lastQuery = '';
    }
}

// Обработчмк входящего текстового сообщения  
bot.on('message', (msg) => {

    var chatId = msg.from.id

    // Старт бота
    if (msg.text === '/start') {
        // Проверяем, есть ли пользователь в текущей базе
        // Если есть — пишем сообщение
        // Если нет — добавляем пользователя в локальную базу и в Airtable
        if (users[chatId]) {
            bot.sendMessage(chatId, `Привет! 
            
Что будем читать сегодня?
            `, {
                reply_markup: {
                    keyboard: keyboards.main
                }
            })
        } else {
            addUser(msg);
            bot.sendMessage(chatId, `Привет! Это собака-робот-библиотекарь!

У меня 89 кейсов, 98 статей и 2 книги про интерфейсы от «<a href="https://sobakapav.ru">Собаки Павловой</a>». Многовато, не так ли? Поэтому я здесь и сижу. Охр-р-раняю! Шучу. 
            
Я помогаю искать подходящие материалы по интересам, годам и другим параметрам. Если вы только недавно узнали о нас, начните с «Лучших кейсов» и «Популярных статей». Там хиты и вечная классика. А если уже читали нас, посмотрите, что выходило в «Свежем». Каждый месяц мы что-то да выпускаем. 
            
И подписывайтесь на наш канал «<a href="https://t.me/pavlova_cc">Собака лает</a>». Там никто не кусается.  
            
Итак, что будем читать сегодня?
            `, {
                reply_markup: {
                    keyboard: keyboards.main
                },
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        }
    }

    // Запускаем поиск по кейсам
    else if (msg.text.toString().toLowerCase().includes('кейсы')) {
        Restore(chatId)
        bot.sendMessage(chatId, 'Отлично! Осталось выбрать подборку кейсов.', {
            reply_markup: {
                inline_keyboard: keyboards.cases
            }
        })
        .then(payload => {
            users[chatId].lastQuery = payload.message_id
        });
        users[chatId].where = 'cases';
    }

    // Запускаем поиск по кейсам
    else if (msg.text.toString().toLowerCase().includes('статьи')) {
        Restore(chatId)
        bot.sendMessage(chatId, 'Супер! Осталось выбрать подборку статей.', {
            reply_markup: {
                inline_keyboard: keyboards.articles
            }
        })
        .then(payload => {
            users[chatId].lastQuery = payload.message_id
        });
        users[chatId].where = 'articles';
    }

    // Забираем книги
    else if (msg.text.toString().toLowerCase().includes('книги')) {
        Restore(chatId)
        bot.sendMessage(chatId, books);

        // Отмечаем в базе, что пользователь забрал книги (просто для статистики)
        userbase('Userbase').update(users[chatId].airtableId, {
            "Send Books": true
          }, function(err) {
            if (err) {
              console.error(err);
              return;
            }
          });
          console.log(new Date().toLocaleString('ru-RU') + ` — Books was given to user ${msg.from.id}`)
    }
    // Кнопки со ссылками на соц. сети
    else if (msg.text == 'Собака в соц. сетях') {
        bot.sendMessage(chatId, 'Читайте нас, где удобно', {
            reply_markup: {
                inline_keyboard: keyboards.social
            }
        })
    }

    // Поиск по ключевому слову
    // Сейчас ищет втупую по подстроке
    // TO-DO: зарефакторить в общую функцию
    else {
        Restore(chatId)
        var message = ''
        cases.forEach((item) => {
            if (item.title.toLowerCase().includes(msg.text.toLowerCase())) {
                message += item.title + '\n' + item.url + '\n\n'
            }
        })

        if (0 < message.length && message.length <= 4096) {
            bot.sendMessage(chatId, message, {
                disable_web_page_preview: true
            })
        } else if (message.length > 4096) {
            bot.sendMessage(chatId, 'Вы ввели слишком общий запрос. Попробуйте уточнить, что нужно найти.')

        } else {bot.sendMessage(chatId, 'Похоже, мы ничего не нашли. \nЕсли вы не ищете кейсы, а пытаетесь нам написать, то вот контакты нашего директора!', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Написать Наталье',
                            url: 'https://t.me/procosha'
                        }
                    ]
                ]
            }
        })}
    }
})

// Обработчик инлайн-кнопок
bot.on('callback_query', (query) => {
        
    // Словарь с фильтрами
    //TO-DO: перенесри в шапку
    var yearMessage = (users[query.from.id].where == 'cases') ? `До 2015 года мы работали в Axure и собирали черно-белые прототипы. Потом начали делать дизайн в Sketch, а с 2019 перешли в Figma.` : `С годами у нас менялись авторы. Поэтому темы и область внимания периодически меняются. `

    var filtres = {
        byYear: {
            message: yearMessage
        },
        byBranch: {
            message: 'Сразу видно, деловой человек. Осталось выбрать отрасль.'
        },
        byTheme: {
            message: 'Директора пишут про менеджмент и бизнес, дизайнеры — про интерфейсы, социологи — про исследования, авторы текстов — про все перечисленное. И каждый иногда заходит на чужую территорию.'
        },
        byFormat: {
            message: 'Деление довольно условное — мы сперва написали около ста статей, а потом уже разделили на форматы.'
        }
    }
    
    var chatId = query.from.id;
    bot.editMessageReplyMarkup({}, {
        chat_id: chatId ,
        message_id: query.message.message_id
      });
    
    // Проверяем, нужно ли сразу выдавать контент, или будет еще один уровень фильтрации
    if (filtres[query.data]) {
        bot.sendMessage(chatId , filtres[query.data].message, {
            reply_markup: {
                inline_keyboard: keyboards[query.data]
            },
            disable_web_page_preview: true
        }).then(payload => {
            users[chatId].lastQuery = payload.message_id
        });
        users[chatId ].filter = query.data;
    } else {
        returnResult(query)
    }
})

// Функция для обновления базы статей и кейсов
function dailyCronTick () {
    cases = [];
    articles = [];
    UpdateCases()
    UpdateArticles()
  }
   
  function sortByPop(arr) {
    arr.sort((a, b) => a.views > b.views ? -1 : 1);
  }
  
// Обработчик, запускающий обновление локальных баз в полночь
dailyCronJob = new cron.CronJob('0 0 * * *', dailyCronTick)

var filter = {
    isBest: function(array, user) {
        array.filter((item) => {
          if (item.isBest) {
            user.data.push(item)
          }
      })
    },
    isPopular: function(array, user) {
        let newArray = array
        sortByPop(newArray)
      newArray.forEach((item, i) => {
        if (i <= 9) {
          user.data.push(item)
        }
    })
    },
    isRecent: function(array, user) {
        array.filter((item) => {
            if (item.isRecent) {
              user.data.push(item)
            }
        })
    },
    byYear: function(array, user, res) {
       array.filter((item) => {
        if (item.year == res) {
            user.data.push(item)
        }
        })
    },
    byBranch: function(array, user, res) {
       array.filter((item) => {
        if (item.branch !== undefined && item.branch.indexOf(res) !== -1) {
            user.data.push(item)
        }
        })
    },
    byTheme: function(array, user, res) {
       array.filter((item) => {
        if (item.theme !== undefined && item.theme.indexOf(res) !== -1) {
            user.data.push(item)
        }
        })
    },
    byFormat: function(array, user, res) {
       array.filter((item) => {
        if (item.format == res) {
            user.data.push(item)
        }
        })
    }
  }

UpdateCases()
UpdateArticles()
UpdateUsers()
  
console.log(new Date().toLocaleString('ru-RU') + ' — Bot was started')