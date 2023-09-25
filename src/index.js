const { Client, IntentsBitField } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages
    ]
});

const token = ''; // Replace with bot's token
const monitoredURL = 'https://kavascan.com/address/0x201ECB1C439F92aFd5df5d399e195F73b01bB0F3/transactions#address-tabs'; // Replace with the URL you want to monitor
let previousContent = '';

client.on('ready', () => {
    //console.log(`Logged in as ${client.user.tag}!`);
    setInterval(checkForChanges, 0.1 * 60 * 1000);
});

const checkForChanges = async () => {
    try {

        const response = await axios.get(monitoredURL);
        const $ = cheerio.load(response.data);
        const elementWithClass = $('.card-body');

        // Get first element with the class #card-body
        const element = elementWithClass.first();

        // Get its 5th child node (zero-based index)
        const child = element.children().eq(4); // Index 4 corresponds to the 5th child(where the transactions are)
            
        // Now, you can work with the 5th child element
        const currentContent = child.text();

        console.log(currentContent);

        if (currentContent.trim() !== previousContent.trim()) {
            previousContent = currentContent;
            const channelID = '1146911112214872157'; // Replace with the channel ID where you want to send notifications
            const channel = client.channels.cache.get(channelID);

            if (channel) {
                const messageToSend = `Content changed!\n${monitoredURL}`;
                channel.send(messageToSend)
                    .then(() => {
                        console.log('Message sent successfully.');
                    })
                    .catch(error => {
                        console.error('Error sending message:', error);
                    });
            } else {
                console.log('Channel not found.');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

client.login(token);

