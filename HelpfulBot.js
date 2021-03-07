const Discord = require('discord.js');
const client = new Discord.Client();
const HOME_DIRECTORY = require('os').homedir().replace(/\\/g, "/");
const WATER_PICTURES_FOLDER = `${HOME_DIRECTORY}/Desktop/water_pictures`;
const STRETCHES_PICTURES_FOLDER = `${HOME_DIRECTORY}/Desktop/stretches_pictures`;
const STRETCHES_TIPS_FOLDER = `${HOME_DIRECTORY}/Desktop/stretches_tips`;
const FS = require('fs');
var WATER_LIST = [];
var STRETCHES_LIST = [];
var TIPS_LIST = [];
var USERS = [];
DisTube = require('distube'),
    config = {
        prefix: ".",
        token: process.env.TOKEN
    };

// Create a new DisTube
const distube = new DisTube(client, { searchSongs: true, emitNewSongOnly: true });

client.on('ready', () => {
    const arrayOfStatus = [
        `Keeping Gamers Alive`,
        `Making Gamers Healthy`,
        `Making Gamers Happy`,
        `Keeping Gamers Active`,
        `.help for help c: `
    ];

    let index = 0;
    setInterval(() => {
        if (index === arrayOfStatus.length) index = 0;
        const satus = arrayOfStatus[index];
        console.log(status);
        client.user.setActivity(satus, { type: "" }).catch(console.error)
        index++;
    }, 2000) //in ms

    console.log(`Logged in as ${client.user.tag}!`);
    FS.readFile('users.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        try {
            console.log(data)
            USERS = JSON.parse(data)
            console.log(USERS.length)
        } catch (e) {
            console.log('file empty')
        }

    })
});

client.on("message", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift();

    if (command == "play")
        distube.play(message, args.join(" "));

    if (["repeat", "loop"].includes(command))
        distube.setRepeatMode(message, parseInt(args[0]));

    if (command == "stop") {
        distube.stop(message);
        message.channel.send("Stopped the music!");
    }

    if (command == "skip")
        distube.skip(message);

    if (command == "queue") {
        let queue = distube.getQueue(message);
        message.channel.send('Current queue:\n' + queue.songs.map((song, id) =>
            `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
        ).slice(0, 10).join("\n"));
    }

    if ([`3d`, `bassboost`, `echo`, `karaoke`, `nightcore`, `vaporwave`].includes(command)) {
        let filter = distube.setFilter(message, command);
        message.channel.send("Current queue filter: " + (filter || "Off"));
    }
});

// Queue status template
const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

// DisTube event listeners, more in the documentation page
distube
    .on("playSong", (message, queue, song) => message.channel.send(
        `Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}\n${status(queue)}`
    ))
    .on("addSong", (message, queue, song) => message.channel.send(
        `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
    ))
    .on("playList", (message, queue, playlist, song) => message.channel.send(
        `Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequested by: ${song.user}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
    ))
    .on("addList", (message, queue, playlist) => message.channel.send(
        `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
    ))
    // DisTubeOptions.searchSongs = true
    .on("searchResult", (message, result) => {
        let i = 0;
        message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
    })
    // DisTubeOptions.searchSongs = true
    .on("searchCancel", (message) => message.channel.send(`Searching canceled`))
    .on("error", (message, e) => {
        console.error(e)
        message.channel.send("An error encountered: " + e);
    });


FS.readdirSync(STRETCHES_TIPS_FOLDER).forEach(file => {
    TIPS_LIST.push(file);
});

FS.readdirSync(WATER_PICTURES_FOLDER).forEach(file => {
    WATER_LIST.push(file);
});
FS.readdirSync(STRETCHES_PICTURES_FOLDER).forEach(file => {
    STRETCHES_LIST.push(file);
});



client.on('message', msg => {
    let message = msg.content.toLowerCase();

    if (message == '.track me') {

        let temp_user = {
            id: msg.author.id,
            tag: msg.author.tag,
            username: msg.author.username,
            status: msg.author.client.presence.status,
            daily_hours: 0,
            weekly_hours: 0,
            total_hours: 0,
            daily_seconds: 0,
            water_seconds: 0,
            strech_seconds: 0
        }

        USERS.push(temp_user)
        let parsedList = JSON.stringify(USERS)
        FS.writeFile('users.txt', parsedList, (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            console.log("added new user")
        })
        msg.reply("Tracking user. Status: " + temp_user.status);
    }
    if (message == '.untrack me') {

        for (let i = 0; i < USERS.length; i++) {
            if (USERS[i].id == msg.author.id) {
                USERS.splice(i, 1);
                let parsedList = JSON.stringify(USERS)
                FS.writeFile('users.txt', parsedList, (err, data) => {
                    if (err) {
                        console.error(err)
                        return
                    }
                    console.log("deleted user")
                })

            }
        }

        msg.reply("Not tracking");
    }

    if (message == '.drank water') {

        let user = get_user(msg.author.id);
        user.water_seconds = 0;
        msg.reply("Water timer reset");
    }

    if (message == '.stretched') {
        let user = get_user(msg.author.id);
        user.strech_seconds = 0;
        msg.reply("strech timer reset");
    }
    if (msg.content === 'xD?') {
        msg.reply('xD!');
    }
    //Direct message to user
    if (message === ".get stretch") {
        send_message(msg.author.id, "Here's a stretch! (. ❛ ᴗ ❛.) .", get_image("tips"));
    }
    if (message === ".help") {
        send_message(msg.author.id,`
        Here's the help commands c: 
        **  .help ** - Displays help menu
        ** .track me ** - I will remind you to drink water and stretch 
        ** .untrack me ** - I will stop reminding you to drink water and stretch 
        ** .stretched ** - Sends a message to me confirming that you have stretched
        ** .drank water ** - Sends a message to me confirming that you drank water 
        ** .play ** - I will search for music that you request via youtube I can take urls or just words "EX: .play old town road" 
        ** .queue ** - I will queue up songs for you ^‿^ 
        ** .skip ** - I will skip the current song and play the next one you have queued 
        ** .stop ** - I will leave the current voice call that I am in 
        `)
    }
});


client.setInterval(loop, 5000);
function loop() {
    for (var i = 0; i < USERS.length; i++) {
        let user = client.users.cache.get(USERS[i].id);
        USERS[i].status = user.client.presence.status;

        if (user.status == "Offline") {
            USERS[i].daily_seconds += 0;
        }
        else if (user.status == "idle") {
            USERS[i].daily_seconds += 0;
        }
        else {
            USERS[i].daily_seconds += 5;
            USERS[i].strech_seconds += 5;
            USERS[i].water_seconds += 5;
            console.log(USERS[i].daily_seconds)
            if (USERS[i].water_seconds == 30) {
                send_message(USERS[i].id, "It's water time!!! (｡◕‿◕｡) ", get_image("water"));
                USERS[i].water_seconds = 0;
            }

            if (USERS[i].strech_seconds == 60) {
                send_message(USERS[i].id, "Let's get up! ^‿^ ", get_image("stretches"));
                USERS[i].strech_seconds = 0;
            }
        }
    }
}

function send_message(user_id, message, image) {
    let user = client.users.cache.get(user_id);

    if (image == null) {
        user.send(message);
    }
    else {
        user.send(message, { files: image });
    }
}

function get_user(user_id) {
    for (let i = 0; i < USERS.length; i++) {
        if (USERS[i].id == user_id) {
            return USERS[i];
        }
    }

    return null;
}

function get_image(type) {

    let image = null;
    if (type == "water") {
        image = [WATER_PICTURES_FOLDER + "/" + WATER_LIST[Math.floor(Math.random() * WATER_LIST.length)]]
    } else if (type == "stretches") {
        image = [STRETCHES_PICTURES_FOLDER + "/" + STRETCHES_LIST[Math.floor(Math.random() * STRETCHES_LIST.length)]]
    } else if (type == "tips") {
        image = [STRETCHES_TIPS_FOLDER + "/" + TIPS_LIST[Math.floor(Math.random() * TIPS_LIST.length)]]
    }

    return image;
}


client.login(config.token);

