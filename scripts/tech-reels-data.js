/**
 * Tech and programming reel topics. One set of copy, rendered in two styles by
 * generate-tech.js: the doodle style (doodle-art.js) and the code-editor style
 * (code-art.js). Same fields as doodle-reels-data.js: each topic becomes a
 * 12-slide set (cover, ten slides, call to action).
 *
 * kind 'facts' topics use documented facts, hedged where a claim is a
 * report, an estimate or a quote. kind 'comedy' is pure jokes: the hook is the
 * line someone says, the fact sets the scene and the punch is the reply.
 * Topics avoid the web and phone history already covered in the earlier sets.
 */
module.exports = [
  {
    slug: 'code-history', kind: 'facts', tag: 'CODE HISTORY',
    cover: { title: ['10 CODING', 'HISTORY FACTS'], sub: 'Before apps, there was Ada.', motif: 'code' },
    cta: { head: ['Your website,', 'written for you.'], sub: 'Simple websites, built for you.' },
    hashtags: '#programming #codinghistory #didyouknow #developer',
    slides: [
      { stat: '1843', hook: 'Ada Lovelace published the first algorithm for a machine.', fact: 'She wrote it in her notes on Charles Babbage\'s Analytical Engine.', punch: 'The first bug report was a century away.' },
      { stat: '1952', hook: 'Grace Hopper built one of the first compilers.', fact: 'Her A-0 system translated instructions into machine code in 1952.', punch: 'She taught computers to read English-like words.' },
      { stat: '1957', hook: 'FORTRAN was among the first high-level languages.', fact: 'John Backus\'s team at IBM released it in 1957 for scientists.', punch: 'Maths homework, but automated.' },
      { stat: '1959', hook: 'COBOL was designed in 1959 and banks still use it.', fact: 'Millions of lines of it still run business systems today.', punch: 'Older than the Moon landing.' },
      { stat: '1972', hook: 'The C language was created around 1972.', fact: 'Dennis Ritchie developed it at Bell Labs, and it shaped many languages after.', punch: 'The grandparent of half your apps.' },
      { motif: 'terminal', hook: 'Hello, World! first appeared in a 1972 tutorial.', fact: 'Brian Kernighan used it at Bell Labs, and every beginner copies it.', punch: 'The most-printed sentence in history.' },
      { stat: '1991', hook: 'Python was first released in 1991.', fact: 'Guido van Rossum named it after Monty Python, not the snake.', punch: 'Cleaner code. Sillier name.' },
      { motif: 'coffee', hook: 'Java was first called Oak.', fact: 'James Gosling\'s team renamed it Java in 1995, after coffee.', punch: 'Powered by caffeine. Obviously.' },
      { stat: '10 days', hook: 'JavaScript was created in about ten days.', fact: 'Brendan Eich built the first version at Netscape in 1995.', punch: 'Ten days. Thirty years of consequences.' },
      { stat: 'Hobby', hook: 'Linux began as a hobby project.', fact: 'Linus Torvalds said in 1991 it would not be big and professional.', punch: 'It now runs a huge share of the internet\'s servers.' },
    ],
  },
  {
    slug: 'web-dev', kind: 'facts', tag: 'WEB DEV',
    cover: { title: ['10 WEB DEV', 'FACTS'], sub: 'Behind every page is a surprise.', motif: 'browser' },
    cta: { head: ['Skip the code.', 'Get a website.'], sub: 'Simple websites, built for you.' },
    hashtags: '#webdev #webdevelopment #didyouknow #coding',
    slides: [
      { stat: '18', hook: 'The first description of HTML had 18 tags.', fact: 'Tim Berners-Lee listed them in 1991.', punch: 'Today there are over a hundred.' },
      { motif: 'palette', hook: 'CSS was proposed in 1994.', fact: 'Håkon Wium Lie suggested it so pages could be styled separately.', punch: 'Finally, pages got outfits.' },
      { stat: '2020', hook: 'Flash officially ended on 31 December 2020.', fact: 'Adobe stopped supporting it after years of decline.', punch: 'RIP, loading bar.' },
      { motif: 'phone', hook: 'Responsive web design got its name in 2010.', fact: 'Ethan Marcotte coined the term for layouts that adapt to any screen.', punch: 'One site. Every pocket.' },
      { stat: '2013', hook: 'React was open sourced in 2013.', fact: 'Facebook released the library for building user interfaces.', punch: 'Everything is a component now.' },
      { stat: '2006', hook: 'jQuery launched in 2006.', fact: 'John Resig built it to make JavaScript easier across browsers.', punch: 'Write less, do more. Literally its slogan.' },
      { stat: '11 lines', hook: 'Eleven lines of code once broke thousands of projects.', fact: 'In 2016 a tiny package called left-pad was removed from npm.', punch: 'Never underestimate padding.' },
      { stat: '2011', hook: 'Bootstrap was born at Twitter.', fact: 'Engineers built it as an internal tool and shared it in 2011.', punch: 'Half the web looked the same for years.' },
      { stat: 'Wasm', hook: 'WebAssembly runs near-native code in your browser.', fact: 'All major browsers supported it by 2017.', punch: 'Browser tabs got serious.' },
      { motif: 'teapot', hook: 'HTTP status 418 means "I\'m a teapot".', fact: 'It came from a 1998 April Fools joke document.', punch: 'The only error code with a tea break.' },
    ],
  },
  {
    slug: 'dev-life', kind: 'comedy', tag: 'DEV LIFE',
    cover: { title: ['10 THINGS', 'DEVS SAY'], sub: 'Every developer has said at least five.', motif: 'face-sweat' },
    cta: { head: ['Stop debugging', 'your website.'], sub: 'Simple websites, built for you.' },
    hashtags: '#devlife #programmerhumor #relatable #coding',
    slides: [
      { motif: 'face-cool', hook: '"It works on my machine."', fact: 'It does not work on any other machine.', punch: 'Fine. We will ship your machine.' },
      { motif: 'face-sleep', hook: '"// TODO: fix later"', fact: 'Written in 2019.', punch: 'Later has arrived. It looks scary.' },
      { motif: 'face-think', hook: '"I will refactor it next sprint."', fact: 'That was six sprints ago.', punch: 'The sprint is a marathon.' },
      { motif: 'face-shock', hook: '"Nobody touched the code."', fact: 'The history says otherwise.', punch: 'git blame: your name.' },
      { motif: 'face-cry', hook: '"Fixed one bug."', fact: 'Found three new ones.', punch: 'Net bugs: plus two.' },
      { motif: 'face-eye', hook: '"Have you tried turning it off and on again?"', fact: 'Yes. Twice.', punch: 'Try again with feeling.' },
      { motif: 'face-laugh', hook: '"It compiles!"', fact: 'It does not do anything yet.', punch: 'Success is relative.' },
      { motif: 'face-sweat', hook: 'Commit message: "fix".', fact: 'Next commit message: "fix again".', punch: 'Final. Final v2. Final really.' },
      { motif: 'face-angry', hook: '"Stack Overflow is down."', fact: 'Nobody can code today.', punch: 'Thoughts and prayers.' },
      { motif: 'face-mind', hook: '"Let us deploy on Friday."', fact: 'Famous last words.', punch: 'See you on Saturday.' },
    ],
  },
  {
    slug: 'ai-data', kind: 'facts', tag: 'AI & DATA',
    cover: { title: ['10 AI', 'FACTS'], sub: 'Smarter than a toaster. Barely.', motif: 'robot' },
    cta: { head: ['Let people', 'find you.'], sub: 'Simple websites, built for you.' },
    hashtags: '#ai #artificialintelligence #didyouknow #tech',
    slides: [
      { stat: '1956', hook: 'The term artificial intelligence was coined for a 1956 workshop.', fact: 'John McCarthy proposed it in 1955 for a summer meeting at Dartmouth.', punch: 'A summer project that never ended.' },
      { stat: '1950', hook: 'Alan Turing asked if machines can think in 1950.', fact: 'His imitation game became known as the Turing test.', punch: 'Still failing at traffic-light pictures.' },
      { stat: '1966', hook: 'ELIZA was an early chatbot from 1966.', fact: 'Joseph Weizenbaum built it at MIT, and people confided in it anyway.', punch: 'The cheapest therapist in history.' },
      { stat: '4-1', hook: 'AlphaGo beat Go champion Lee Sedol 4 to 1.', fact: 'The match took place in 2016 and surprised many experts.', punch: 'The one game he won mattered.' },
      { stat: '2012', hook: '2012 was a turning point for deep learning.', fact: 'A neural network won the ImageNet image recognition contest by a wide margin.', punch: 'Cats were identified. Humanity relaxed.' },
      { stat: '2017', hook: 'Transformers changed AI in 2017.', fact: 'A Google paper titled Attention Is All You Need introduced the design.', punch: 'No robots in disguise. Just maths.' },
      { motif: 'roomba', hook: 'The Roomba launched in 2002.', fact: 'It became one of the first robots in millions of homes.', punch: 'It bumps into things. Like us.' },
      { stat: '100M', hook: 'ChatGPT reportedly reached 100 million users in about two months.', fact: 'It launched in November 2022 and grew faster than most apps before it.', punch: 'Everyone had an opinion by Tuesday.' },
      { stat: '1965', hook: 'Moore\'s Law began as a 1965 prediction.', fact: 'Gordon Moore expected chip components to keep doubling on a regular schedule.', punch: 'The longest-running self-fulfilling prophecy.' },
      { motif: 'checkbox', hook: 'Solving CAPTCHAs helped digitise books.', fact: 'reCAPTCHA used human answers to read words computers could not.', punch: 'You were a volunteer librarian.' },
    ],
  },
  {
    slug: 'hardware-net', kind: 'facts', tag: 'HARDWARE',
    cover: { title: ['10 HARDWARE', 'FACTS'], sub: 'The machines behind the magic.', motif: 'chip' },
    cta: { head: ['Give your site', 'a good home.'], sub: 'Simple websites, built for you.' },
    hashtags: '#hardware #technology #didyouknow #computers',
    slides: [
      { stat: '95%', hook: 'Undersea cables carry about 95% of international data.', fact: 'Satellites handle only a small share of global traffic.', punch: 'The internet is mostly wet.' },
      { stat: '5 MB', hook: 'The first hard drive stored about 5 megabytes.', fact: 'IBM\'s RAMAC from 1956 weighed more than a tonne.', punch: 'One photo, one forklift.' },
      { motif: 'chip', hook: 'The first commercial microprocessor came in 1971.', fact: 'Intel\'s 4004 had about 2,300 transistors.', punch: 'Phones now have billions.' },
      { stat: '1996', hook: 'USB arrived in 1996.', fact: 'It was designed to replace a mess of different ports.', punch: 'It still takes three tries to plug in.' },
      { motif: 'wifi', hook: 'The first Wi-Fi standard was released in 1997.', fact: 'It was called 802.11 and ran at up to 2 megabits per second.', punch: 'Slow, but wireless. Magic.' },
      { motif: 'keyboard', hook: 'The QWERTY layout dates from the 1870s.', fact: 'Christopher Latham Sholes developed it for typewriters.', punch: 'We kept it for 150 years.' },
      { motif: 'server', hook: 'Data centres use roughly 1 to 2% of the world\'s electricity.', fact: 'Estimates vary, but computing and cooling both take a lot of power.', punch: 'The cloud has a power bill.' },
      { stat: '4', hook: 'ARPANET started with just four computers.', fact: 'By the end of 1969 four universities were connected.', punch: 'The original group chat.' },
      { motif: 'floppy', hook: 'The save icon is a floppy disk.', fact: 'IBM introduced the floppy disk in 1971, and the icon outlived it.', punch: 'Some users think it is a coaster.' },
      { stat: '4 bits', hook: 'Half a byte is called a nibble.', fact: 'A byte is eight bits, so a nibble is four.', punch: 'Computing has a sense of humour.' },
    ],
  },
  {
    slug: 'cyber-security', kind: 'facts', tag: 'STAY SAFE ONLINE',
    cover: { title: ['10 SECURITY', 'FACTS'], sub: 'Lock the door. And the window.', motif: 'shield' },
    cta: { head: ['Build a safe', 'online home.'], sub: 'Simple websites, built for you.' },
    hashtags: '#cybersecurity #staysafeonline #didyouknow #tech',
    slides: [
      { stat: '123456', hook: '123456 is one of the most common passwords.', fact: 'Yearly lists of leaked passwords keep putting it near the top.', punch: 'Hackers say thank you.' },
      { stat: 'Phish', hook: 'Phishing is named after fishing.', fact: 'Attackers cast bait in emails and wait for someone to bite.', punch: 'Do not take the bait.' },
      { stat: '1971', hook: 'The first computer virus was called Creeper.', fact: 'It displayed the message I\'m the creeper, catch me if you can.', punch: 'Rude. But historic.' },
      { motif: 'padlock', hook: 'Two-factor login blocks most automated attacks.', fact: 'Microsoft has said multi-factor authentication stops over 99% of automated account attacks.', punch: 'One extra tap. Big difference.' },
      { stat: 'HTTPS', hook: 'The padlock in your browser does not make a site trustworthy.', fact: 'It only means the connection to the site is encrypted.', punch: 'A locked door can still lead to a bad room.' },
      { motif: 'mail', hook: 'The ILOVEYOU worm spread by email in 2000.', fact: 'It reached millions of computers within days.', punch: 'The least romantic love letter ever.' },
      { stat: '1988', hook: 'The Morris worm hit the internet in 1988.', fact: 'It was one of the first major worms and slowed thousands of computers.', punch: 'It taught the internet to lock up.' },
      { stat: 'Caesar', hook: 'The Caesar cipher is named after Julius Caesar.', fact: 'He reportedly shifted letters by three to hide military messages.', punch: 'Decoded in under a minute. Still iconic.' },
      { motif: 'key', hook: 'A password manager can create unique passwords for every site.', fact: 'You remember one strong password and the manager remembers the rest.', punch: 'Finally, a key ring for the internet.' },
      { stat: 'DROP', hook: 'A famous comic joked about a student named Bobby Tables.', fact: 'His name included a command that deletes a school database.', punch: 'Always sanitise your inputs.' },
    ],
  },
];
