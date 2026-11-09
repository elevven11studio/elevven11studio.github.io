/**
 * Tech and programming square posts, rendered in both styles by
 * generate-tech.js. Same fields as doodle-posts-data.js: tag, hook, fact, punch,
 * and either stat or motif.
 *
 * TECH TRIVIA is documented fact (hedged where reports differ). WEB BASICS
 * explains terms for people who are not developers. CODER JOKES are jokes.
 * CODING TIPS are advice, not facts. No prices: the audience is worldwide.
 */
const T = 'TECH TRIVIA';
const W = 'WEB BASICS';
const J = 'CODER JOKES';
const C = 'CODING TIPS';

module.exports = [
  { tag: T, stat: 'Googol', hook: 'Google is named after a very big number.', fact: 'A googol is 1 followed by 100 zeros, and the founders misspelled it.', punch: 'A typo that built a giant.' },
  { tag: T, stat: 'Yahoo', hook: 'Yahoo was said to stand for Yet Another Hierarchical Officious Oracle.', fact: 'The founders also liked the word for its playful meaning.', punch: 'Backronym energy.' },
  { tag: T, stat: '1,000', hook: 'The first iPod held 1,000 songs.', fact: 'It launched in 2001 with 5 gigabytes of storage.', punch: 'A thousand songs. Zero streaming.' },
  { tag: T, stat: '1958', hook: 'One of the first video games was Tennis for Two.', fact: 'William Higinbotham made it in 1958 using an oscilloscope.', punch: 'Graphics: one line. Fun: unlimited.' },
  { tag: T, stat: '1984', hook: 'Tetris was created in 1984.', fact: 'Alexey Pajitnov built it in the Soviet Union.', punch: 'Still stacking. Still stressing.' },
  { tag: T, stat: 'Satoshi', hook: 'Bitcoin\'s creator is still unknown.', fact: 'The name Satoshi Nakamoto has never been conclusively linked to one person.', punch: 'The world\'s best-kept secret.' },
  { tag: T, stat: '1983', hook: 'The first 3D printer dates from 1983.', fact: 'Chuck Hull invented stereolithography, building objects layer by layer.', punch: 'Printing in 3D before it was cool.' },
  { tag: T, motif: 'globe', hook: 'GPS was opened to the public in the 1980s.', fact: 'It began as a US military system before civilians could use it.', punch: 'Now it finds your coffee.' },
  { tag: T, stat: '1968', hook: 'The Mother of All Demos was in 1968.', fact: 'Douglas Engelbart showed a mouse, hyperlinks and video calls in one talk.', punch: 'The future, shown decades early.' },
  { tag: T, stat: '1976', hook: 'Queen Elizabeth II sent an email in 1976.', fact: 'She reportedly became one of the first heads of state to send one.', punch: 'Reply all was not yet invented.' },

  { tag: W, motif: 'globe', hook: 'A domain name is your address.', fact: 'It is what people type to find you, like yourbrand.com.', punch: 'Not your cousin\'s nickname.' },
  { tag: W, motif: 'server', hook: 'Hosting is where your website lives.', fact: 'It is a computer that stays on so visitors can load your pages.', punch: 'Rent for your website. Sometimes free.' },
  { tag: W, stat: 'HTML', hook: 'HTML is the structure of a page.', fact: 'It tells the browser what is a heading, a paragraph and a button.', punch: 'The skeleton of every page.' },
  { tag: W, motif: 'palette', hook: 'CSS is the style.', fact: 'It controls colours, spacing and layout.', punch: 'The outfit on the skeleton.' },
  { tag: W, stat: 'JS', hook: 'JavaScript is the behaviour.', fact: 'It makes menus open and forms respond.', punch: 'The skeleton learns to dance.' },
  { tag: W, motif: 'padlock', hook: 'SSL gives you the padlock.', fact: 'It encrypts the connection between a visitor and your site.', punch: 'A lock on the front door.' },
  { tag: W, motif: 'magnifier', hook: 'SEO helps people find you.', fact: 'It means clear titles and content so search engines understand each page.', punch: 'Not magic. Just clear writing.' },
  { tag: W, motif: 'phone', hook: 'A responsive site fits every screen.', fact: 'The layout adjusts for phones, tablets and laptops.', punch: 'One site. Every pocket.' },
  { tag: W, motif: 'pencil', hook: 'A CMS lets you edit without code.', fact: 'A content management system keeps text and pages in a simple dashboard.', punch: 'Also known as the edit button.' },
  { tag: W, motif: 'browser', hook: 'A favicon is the tiny icon on a browser tab.', fact: 'It helps people spot your site among many open tabs.', punch: 'Tiny logo. Big recall.' },

  { tag: J, stat: '10', hook: 'There are 10 types of people.', fact: 'Those who understand binary and those who do not.', punch: 'Still funny at 10.' },
  { tag: J, motif: 'server', hook: 'A SQL query walks into a bar.', fact: 'It sees two tables and asks: can I join you?', punch: 'Classic inner join.' },
  { tag: J, motif: 'moon', hook: 'Why do programmers prefer dark mode?', fact: 'Because light attracts bugs.', punch: 'The moths approve.' },
  { tag: J, motif: 'bulb', hook: 'How many programmers does it take to change a light bulb?', fact: 'None. It is a hardware problem.', punch: 'Not my department.' },
  { tag: J, motif: 'bug', hook: 'Debugging is detective work.', fact: 'You are also the person who committed the crime.', punch: 'The bug was inside the house.' },
  { tag: J, stat: ';', hook: 'One missing semicolon broke the build.', fact: 'It took two hours to find.', punch: 'Tiny dot. Big drama.' },
  { tag: J, stat: '+1', hook: 'Off-by-one errors are a classic.', fact: 'Start counting at zero or one and the whole loop shifts.', punch: 'Count again. Then count the count.' },
  { tag: J, motif: 'keyboard', hook: 'Copy and paste is a coder\'s best friend.', fact: 'Until it pastes the wrong thing.', punch: 'Ctrl+Z, the true hero.' },
  { tag: J, stat: 'Loop', hook: 'To understand recursion, first understand recursion.', fact: 'Developers have told this joke for decades.', punch: 'See: recursion.' },
  { tag: J, stat: 'here', hook: 'The classic debugging strategy is adding more logs.', fact: 'Soon the console says here, here again and why.', punch: 'Four hundred lines of here.' },

  { tag: C, stat: 'x?', hook: 'Name things clearly.', fact: 'A good name saves a comment.', punch: 'x is not a name.' },
  { tag: C, motif: 'floppy', hook: 'Commit small and often.', fact: 'Small commits are easier to review and undo.', punch: 'Your future self says thanks.' },
  { tag: C, motif: 'face-think', hook: 'Read the error message.', fact: 'It often says exactly what is wrong.', punch: 'It is not shouting. It is helping.' },
  { tag: C, stat: 'KISS', hook: 'Write the simplest thing first.', fact: 'Clever can wait until it works.', punch: 'Boring code ships.' },
  { tag: C, motif: 'disc', hook: 'Back up your work.', fact: 'Use version control and keep a second copy.', punch: 'Hard drives retire without notice.' },
  { tag: C, motif: 'petri', hook: 'Test one thing at a time.', fact: 'Change one thing, run it, then move on.', punch: 'Science, but with semicolons.' },
  { tag: C, motif: 'coffee', hook: 'Take breaks.', fact: 'Many bugs are found after stepping away.', punch: 'Your brain debugs in the shower.' },
  { tag: C, stat: 'Why?', hook: 'Comment the why, not the what.', fact: 'Code shows what happens. Comments should explain why.', punch: '"Adds one" is not a comment.' },
  { tag: C, motif: 'padlock', hook: 'Keep passwords out of your code.', fact: 'Use environment variables and keep secrets private.', punch: 'Public repo. Private panic.' },
  { tag: C, motif: 'book', hook: 'Learn one language well.', fact: 'The concepts carry over to the next one.', punch: 'Depth beats a long list.' },
];
