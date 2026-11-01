/**
 * Copy for generate-fact-posts.js. One entry per post:
 *
 *   tag    small label in the corner
 *   hook   the big headline (keep it under about 60 characters)
 *   fact   one or two sentences that back it up
 *   punch  the joke, shown in the speech bubble
 *   stat   a short string shown huge on a banner, OR
 *   motif  the name of a drawing in generate-fact-posts.js
 *
 * Every WEB HISTORY and TECH TRIVIA entry is a documented fact. The two
 * "reportedly" and "estimates" lines carry a hedge on purpose, because the
 * figures come from studies and not from a single source of record. HOT TAKE
 * entries are opinions and say so. Keep prices out of these: the posts are for
 * a worldwide audience.
 */
const H = 'WEB HISTORY';
const T = 'TECH TRIVIA';
const O = 'HOT TAKE';
const E = 'ELEVVEN11 FACT';

module.exports = [
  { tag: H, stat: '1991', hook: 'The first website is still online.', fact: 'CERN launched it in 1991. It explained what the web was.', punch: 'No cookie banner. Respect.' },
  { tag: H, stat: '1993', hook: 'The web was given away for free.', fact: 'In 1993 CERN put the web technology in the public domain.', punch: 'Free web. Paid coffee. Fair deal.' },
  { tag: H, motif: 'globe', hook: 'The first browser was named WorldWideWeb.', fact: 'It was renamed Nexus so nobody confused it with the web itself.', punch: 'Naming things is hard. Keep your domain simple.' },
  { tag: H, stat: '1971', hook: 'The first email was probably keyboard mashing.', fact: 'Ray Tomlinson sent it in 1971 and recalled it was likely QWERTYUIOP.', punch: 'Your inbox has been chaos ever since.' },
  { tag: H, motif: 'snail', hook: 'Italians call the @ sign a snail.', fact: 'Chiocciola means snail, which is how fast some people reply.', punch: 'Add a WhatsApp button. Beat the snail.' },
  { tag: H, stat: '1985', hook: 'The first .com was registered in 1985.', fact: 'It was symbolics.com, the very first .com ever registered.', punch: 'Your business name is probably still free. Probably.' },
  { tag: H, motif: 'magnifier', hook: 'Google was almost called BackRub.', fact: 'That was the search project name in 1996.', punch: 'Glad somebody said no.' },
  { tag: H, motif: 'coffee', hook: 'The first webcam watched a coffee pot.', fact: 'In 1991 Cambridge researchers pointed a camera at it so nobody walked to an empty pot.', punch: 'Peak productivity. Your site can do better.' },
  { tag: H, stat: 'LO', hook: 'The first message sent online was LO.', fact: 'In 1969 ARPANET tried to type LOGIN and crashed after two letters.', punch: 'Even the internet had a bad first day.' },
  { tag: H, motif: 'moth', hook: 'The first computer bug was a real moth.', fact: 'In 1947 engineers taped one found in a Harvard computer into their logbook.', punch: 'We only hire moth-free developers.' },
  { tag: H, motif: 'mouse', hook: 'The first computer mouse was made of wood.', fact: 'Douglas Engelbart built the prototype in the 1960s.', punch: 'No right click. Plenty of splinters.' },
  { tag: H, stat: 'twttr', hook: 'The first tweet was posted in 2006.', fact: 'Jack Dorsey wrote: just setting up my twttr.', punch: 'Vowels were too expensive.' },
  { tag: H, stat: '0:19', hook: 'The first YouTube video is 19 seconds long.', fact: 'Me at the zoo was uploaded in 2005.', punch: 'Your homepage gets even less time to impress.' },
  { tag: H, motif: 'phone', hook: 'The first text message said Merry Christmas.', fact: 'It was sent from a computer to a phone in 1992.', punch: 'Now we send forty voice notes instead.' },
  { tag: H, stat: '44%', hook: 'The first banner ad reportedly got 44% clicks.', fact: 'AT&T ran it in 1994 and simply told people to click.', punch: 'Today people only click ads by accident.' },
  { tag: H, stat: '$14.83', hook: 'The first thing sold on eBay was a broken laser pointer.', fact: 'It sold in 1995. The seller checked that the buyer knew it was broken.', punch: 'If that sells online, so can your products.' },
  { tag: H, motif: 'box', hook: 'Amazon was first called Cadabra.', fact: 'Jeff Bezos changed the name after a lawyer heard it as cadaver.', punch: 'Good thing he checked before printing the boxes.' },

  { tag: T, motif: 'wifi', hook: 'Wi-Fi does not stand for anything.', fact: 'A branding agency invented the name. Wireless fidelity was an afterthought.', punch: 'Like most business names. Pure vibes.' },
  { tag: T, motif: 'crown', hook: 'Bluetooth is named after a Danish king.', fact: 'Harald Bluetooth united Denmark, and the tech connects devices.', punch: 'Your website unites customers. Less beard.' },
  { tag: T, motif: 'mail', hook: 'Spam is named after a comedy sketch.', fact: 'The Monty Python sketch repeats the word until nothing else is heard.', punch: 'Just like your family group chat.' },
  { tag: T, motif: 'smiley', hook: 'Emoji means picture character.', fact: 'It comes from Japanese: e for picture, moji for character.', punch: 'Not emotion. Your customers still send both.' },
  { tag: T, stat: '2008', hook: 'The first iPhone had no App Store.', fact: 'Apps arrived in 2008, a year after launch.', punch: 'Websites never needed permission.' },
  { tag: T, motif: 'robot', hook: 'Robot comes from a word for forced labor.', fact: 'Czech robota, popularised by a 1920 play.', punch: 'Your website works free. No lunch break.' },
  { tag: T, stat: '250kg', hook: 'A 1 GB hard drive weighed about 250 kg.', fact: 'IBM sold the fridge-sized drive in 1980.', punch: 'Now it fits on a keychain and still gets full.' },
  { tag: T, motif: 'camera', hook: 'The first photo on the web was a band.', fact: 'Les Horribles Cernettes, a band of CERN staff, in 1992.', punch: 'Be the first in your town with a good gallery.' },
  { tag: T, stat: '50ms', hook: 'People judge a website in 50 milliseconds.', fact: 'A 2006 study found first impressions form that fast.', punch: 'Faster than picking a pizza topping.' },
  { tag: T, stat: '53%', hook: 'Slow sites lose people.', fact: 'Google found 53% of mobile visits are abandoned after 3 seconds.', punch: 'Fast sites keep thumbs happy.' },
  { tag: T, motif: 'phone', hook: 'Over half of web traffic is on phones.', fact: 'So your site has to look great on a small screen first.', punch: 'Check it on a phone, not just your laptop.' },
  { tag: T, stat: '2B+', hook: 'More than 2 billion people use WhatsApp.', fact: 'That makes it one of the busiest shop counters on earth.', punch: 'Your WhatsApp button works the counter for you.' },
  { tag: T, motif: 'ghost', hook: 'Most websites are digital ghost towns.', fact: 'Estimates say fewer than 20% of sites are actively used.', punch: 'Be the one that answers the door.' },
  { tag: T, motif: 'podium', hook: 'Page two is where clicks go to die.', fact: 'Studies show the top search result takes about a quarter of clicks.', punch: 'Basic SEO setup comes with Plus.' },
  { tag: T, motif: 'key', hook: 'The first computer password came from MIT.', fact: 'It appeared in the 1960s, and someone surely forgot it.', punch: 'Password123 is not a security plan.' },
  { tag: T, motif: 'qr', hook: 'QR codes were invented to track car parts.', fact: 'Denso Wave created them in 1994 for the car industry.', punch: 'Now they open your menu.' },
  { tag: T, stat: ':-)', hook: 'The smiley :-) was proposed in 1982.', fact: 'Scott Fahlman suggested it on a university message board.', punch: 'Your site can smile back too.' },
  { tag: T, stat: '45 BC', hook: 'Lorem ipsum is older than your landlord.', fact: 'The placeholder text comes from a work by Cicero, written in 45 BC.', punch: 'Placeholder text sells nothing.' },
  { tag: T, motif: 'disc', hook: 'Netflix started as DVDs by mail.', fact: 'Subscribers got movies through the post before streaming.', punch: 'Websites need no stamp.' },
  { tag: T, stat: 'Burbn', hook: 'Instagram started as an app called Burbn.', fact: 'The founders kept the photo feature and dropped the rest.', punch: 'Great pivot. Your site can pivot too.' },
  { tag: T, motif: 'heart', hook: 'YouTube began as a video dating idea.', fact: 'The founders pitched it that way before opening it to everything.', punch: 'Love at first upload.' },
  { tag: T, stat: '1973', hook: 'The first mobile call was to a rival.', fact: 'Martin Cooper called a competitor on a phone weighing about 1 kg.', punch: 'Bold marketing. Zero fear.' },
  { tag: T, motif: 'lego', hook: 'Google first built a server rack with Lego.', fact: 'The 1996 prototype used Lego bricks for its drive casing.', punch: 'Big plans start small. So does a Starter site.' },
  { tag: T, motif: 'cloud', hook: 'The cloud is just buildings full of computers.', fact: 'Data centres packed with fans, cables and a lot of air conditioning.', punch: 'It never rains data. Sadly.' },

  { tag: O, motif: 'card', hook: 'A business card is a website that cannot scroll.', fact: 'It holds a name, a number and not much else.', punch: 'Put the rest one tap away.' },
  { tag: O, motif: 'sign', hook: 'Social media is rented land.', fact: 'The rules, the algorithm and the reach can all change overnight.', punch: 'Own the shop, not just the stall.' },
  { tag: O, stat: 'Cuz?', hook: '"My cousin does websites" is a risk.', fact: 'Cousins are great. Deadlines are optional for cousins.', punch: 'We reply, deliver and send you a link.' },
  { tag: O, motif: 'moon', hook: 'Your website works while you sleep.', fact: 'It answers the same five questions at 3am without complaining.', punch: 'Best employee ever. Needs no snacks.' },
  { tag: O, motif: 'bubbles', hook: 'A screenshot chain is not a catalog.', fact: 'Ten price screenshots in a chat is nobody\'s idea of shopping.', punch: 'One link. Everything. Done.' },
  { tag: O, stat: 'DM?', hook: '"DM for price" is not a price.', fact: 'Many people leave when they have to ask.', punch: 'Show the price. Watch trust go up.' },
  { tag: O, stat: 'Teh', hook: 'Typos live forever online.', fact: 'A screenshot of your mistake can outlive your business.', punch: 'We check your text before launch.' },
  { tag: O, motif: 'clock', hook: 'The best time to get a website was last year.', fact: 'The second best time is before your competitor does.', punch: 'Today works too.' },
  { tag: O, motif: 'hourglass', hook: 'Customers will not wait.', fact: 'A page that takes ten seconds can feel like a lifetime.', punch: 'Keep it fast and keep them.' },

  { tag: E, stat: '0', hook: 'No monthly hosting fee.', fact: 'Eligible sites run on free GitHub Pages hosting.', punch: 'Rent is for apartments.' },
  { tag: E, stat: '54', hook: '54 live demos to browse.', fact: 'Eighteen industries, three styles each, all open on your phone.', punch: 'Window shopping is allowed.' },
  { tag: E, stat: '1x', hook: 'Pay once. Own the site.', fact: 'Packages are one-time prices with a free update period.', punch: 'Subscriptions can stay on your TV.' },
  { tag: E, motif: 'cart', hook: 'Your store can take orders on WhatsApp.', fact: 'Customers fill a cart and the order lands in your chat.', punch: 'No app. No tears.' },
  { tag: E, motif: 'pencil', hook: 'Updates are free after launch.', fact: 'Changing text, images and phone numbers counts as a free update in your window.', punch: 'Typo fixed. Ego saved.' },
  { tag: E, motif: 'phone', hook: 'We build mobile apps too.', fact: 'Flutter apps for Android and iPhone from one codebase.', punch: 'One codebase. Two happy phones.' },
  { tag: E, motif: 'qr', hook: 'Your website can live on a QR code.', fact: 'Print it on flyers, cards and signs so people scan and land.', punch: 'Scan me. No pressure.' },
  { tag: E, motif: 'calculator', hook: 'Free tools, right in your browser.', fact: 'Calculators and utilities that run on your device. Nothing is uploaded.', punch: 'Calculations without the headache.' },
  { tag: E, motif: 'megaphone', hook: 'Referral agents earn commission.', fact: 'Know someone who needs a website? Share your link and get paid.', punch: 'Get paid for gossip. Legally.' },
];
