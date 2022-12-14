// Based on https://www.brightec.co.uk/blog/podcasting-to-those-without-internet-access

exports.handler = function(context, event, callback) {
    let twiml = new Twilio.twiml.VoiceResponse();
    
    let Parser = require('rss-parser');
    let parser = new Parser();
    
    // Define the list of podcasts and fetch the data
    const url = 'https://feeds.buzzsprout.com/1218638.rss?limit=8';
    parser.parseURL(url, function (err, feed) {
        if (err) {
            twiml.say({voice: 'man', language: 'en-us'}, 'Sorry an error occurred fetching the podcasts');
    	    callback(err, twiml);
    	    twiml.hangup();
        }

        // Validate we have some podcast data
        const podcasts = feed.items;
        if (feed === undefined || podcasts === undefined || podcasts.length === 0) {
            twiml.say({voice: 'man', language: 'en-us'}, 'Sorry an error occurred fetching the podcasts');
    	    callback(null, twiml);
    	    twiml.hangup();
        }
        
        // Produce a menu, based on the podcasts found, if no phone key(digit) was pressed...
        if (event.Digits === undefined || event.Digits === '*' || event.Digits > podcasts.length) {
            const podcastMenu = podcasts.map((podcast, index) => {
                const podcastTitle = podcast.itunes.author+' speaking on '+podcast.title;
                return 'Press '+index+' for '+podcastTitle
            }).join(",");
            const repeatInstructions = ', Press * to repeat these options';
            twiml.gather({numDigits: 1})
            .say({voice: 'man', language: 'en-us'}, 'Welcome to Seforim Chatter, '+podcastMenu+repeatInstructions)
        } else {
            // ... otherwise, get the right podcast based on the key pressed.
            const podcastIndex = event.Digits;
            const podcast = podcasts[podcastIndex];
            
            if (podcast === undefined) {
                twiml.say({voice: 'man', language: 'en-us'}, 'Sorry an error occurred fetching the podcasts');
    	        callback(null, twiml);
    	        twiml.hangup();
            }
            
          	twiml.say({voice: 'man', language: 'en-us'}, 'Please wait whilst we fetch the podcast.');
    	    twiml.play(podcast.enclosure.url);
    	    twiml.hangup();
        }

        callback(null, twiml);
    });
};