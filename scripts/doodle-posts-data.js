/**
 * Copy for generate-doodle-posts.js. One entry per square post:
 *
 *   tag    label in the corner
 *   hook   the big headline
 *   fact   the supporting line
 *   punch  the joke, written on the sticky note
 *   stat   a short string shown huge, OR
 *   motif  a drawing from fact-art.js
 *
 * ANCIENT HISTORY, AFRICA FACTS, TRANSPORT FACTS, BUSINESS ORIGINS and DINOSAUR
 * FACTS are documented facts. WEB TIP posts are advice, not facts. Keep the
 * topics fresh: none of these repeat the sticker posts in fact-posts-data.js or
 * the topics in reel-carousels-data.js. No prices: the audience is worldwide.
 */
const A = 'ANCIENT HISTORY';
const F = 'AFRICA FACTS';
const T = 'TRANSPORT FACTS';
const W = 'WEB TIP';
const B = 'BUSINESS ORIGINS';
const D = 'DINOSAUR FACTS';

module.exports = [
  { tag: A, motif: 'pyramid', hook: 'The Great Pyramid was the tallest structure for about 3,800 years.', fact: 'It was built for Pharaoh Khufu around 2560 BC.', punch: 'Longest world record. Ever.' },
  { tag: A, stat: 'Cleopatra', hook: 'Cleopatra lived closer to the Moon landing than to the pyramids.', fact: 'About 2,500 years separated her from the pyramid. About 2,000 from the Moon landing.', punch: 'Time is weird.' },
  { tag: A, stat: 'Eww', hook: 'Romans used urine to clean clothes.', fact: 'Launderers collected it because it contains ammonia.', punch: 'Fresh and clean. Please do not ask how.' },
  { tag: A, stat: '3400 BC', hook: 'Writing began around 3400 BC.', fact: 'Early cuneiform appeared in Mesopotamia, pressed into clay.', punch: 'The first sticky note was heavy.' },
  { tag: A, stat: '776 BC', hook: 'The traditional date of the first Olympics is 776 BC.', fact: 'They were held at Olympia in ancient Greece.', punch: 'Prize: a crown of olive leaves.' },
  { tag: A, stat: '240km', hook: 'Stonehenge\'s blue stones came from Wales.', fact: 'They were moved about 240 kilometres from the Preseli Hills.', punch: 'Best moving company in history.' },
  { tag: A, stat: '8,000', hook: 'The Terracotta Army has thousands of soldiers.', fact: 'Experts estimate about 8,000 clay figures, discovered in 1974.', punch: 'Every face is different.' },
  { tag: A, stat: '50,000', hook: 'The Colosseum could hold around 50,000 people.', fact: 'Romans used numbered entrances to move the crowd.', punch: 'Fast exits. Slow movies.' },
  { tag: A, stat: 'Idiot', hook: 'Idiot once meant a private person in Greek.', fact: 'The word idiotes described someone who stayed out of public life.', punch: 'Then it got personal.' },
  { tag: A, stat: 'Myth', hook: 'You cannot see the Great Wall from the Moon.', fact: 'It is long, but too narrow to spot from that far away.', punch: 'Myth busted. Wall feelings hurt.' },

  { tag: F, stat: '54', hook: 'Africa has 54 recognised countries.', fact: 'More than any other continent.', punch: 'Plenty of jollof debates.' },
  { tag: F, stat: '200M+', hook: 'Nigeria is Africa\'s most populous country.', fact: 'More than 200 million people live there.', punch: 'Largest group chat in Africa.' },
  { tag: F, stat: '6,650km', hook: 'The Nile is among the longest rivers on Earth.', fact: 'It runs about 6,650 kilometres through northeast Africa.', punch: 'The longest commute on water.' },
  { tag: F, stat: '5,895m', hook: 'Kilimanjaro is Africa\'s tallest mountain.', fact: 'It rises 5,895 metres in Tanzania and stands alone, not in a range.', punch: 'Bring a jacket for the equator.' },
  { tag: F, motif: 'crown', hook: 'Mansa Musa may have been the richest person ever.', fact: 'The 14th century ruler of Mali was famous for his gold.', punch: 'His travel budget shook economies.' },
  { tag: F, stat: '13', hook: 'Ethiopia has a calendar with 13 months.', fact: 'Twelve months have 30 days, plus a short thirteenth month.', punch: 'Thirteen months of Mondays.' },
  { tag: F, stat: '90%', hook: 'Most of Madagascar\'s wildlife is found nowhere else.', fact: 'Around 90 percent of its wildlife is endemic to the island.', punch: 'Exclusive guests only.' },
  { tag: F, stat: '#2', hook: 'Lake Victoria is the world\'s second largest freshwater lake.', fact: 'By surface area, only Lake Superior is bigger.', punch: 'Just call it a medium pond.' },
  { tag: F, stat: '19', hook: 'Africa has the youngest population of any continent.', fact: 'The median age is around 19.', punch: 'Plenty of future entrepreneurs.' },
  { tag: F, motif: 'book', hook: 'Timbuktu was a famous centre of learning.', fact: 'Its libraries held thousands of manuscripts centuries ago.', punch: 'The original knowledge hub.' },

  { tag: T, motif: 'car', hook: 'The first practical car was patented in 1886.', fact: 'Karl Benz\'s three-wheeled Motorwagen is considered the first.', punch: 'Top speed: brisk jogging.' },
  { tag: T, stat: '1913', hook: 'Ford introduced the moving assembly line in 1913.', fact: 'It cut the time to build a Model T from about 12 hours to about 90 minutes.', punch: 'Faster than your last delivery.' },
  { tag: T, motif: 'trafficlight', hook: 'The first traffic light was installed in London in 1868.', fact: 'It used gas lamps and was worked by a police officer.', punch: 'It blew up the following year.' },
  { tag: T, stat: '1959', hook: 'Volvo gave away the three-point seat belt.', fact: 'Nils Bohlin invented it in 1959, and Volvo shared the patent for free.', punch: 'Best free gift ever.' },
  { tag: T, stat: '12s', hook: 'The first powered flight lasted 12 seconds.', fact: 'Orville Wright flew about 36 metres in 1903.', punch: 'Shorter than a sitcom intro.' },
  { tag: T, motif: 'plane', hook: 'Concorde flew from London to New York in about 3.5 hours.', fact: 'It cruised at twice the speed of sound.', punch: 'Arrive before you left. Almost.' },
  { tag: T, motif: 'bicycle', hook: 'The ancestor of the bicycle had no pedals.', fact: 'Karl von Drais built his running machine in 1817.', punch: 'Your legs were the engine.' },
  { tag: T, motif: 'train', hook: 'The London Underground opened in 1863.', fact: 'It was the world\'s first underground railway.', punch: 'Mind the gap. Since 1863.' },
  { tag: T, stat: '1854', hook: 'Elevators got a safety brake in the 1850s.', fact: 'Elisha Otis demonstrated his brake in 1854 by cutting the rope himself.', punch: 'Brave marketing. Brave customer.' },
  { tag: T, stat: '1783', hook: 'The first hot air balloon passengers were animals.', fact: 'A sheep, a duck and a rooster flew in France in 1783.', punch: 'Best first-class seats ever.' },

  { tag: W, motif: 'phone', hook: 'Put your phone number at the top.', fact: 'People on phones want to tap once and call.', punch: 'Do not make them hunt for it.' },
  { tag: W, stat: '1', hook: 'Give each page one main button.', fact: 'Book, call or buy. Pick the one that matters most.', punch: 'Ten buttons is a maze.' },
  { tag: W, motif: 'camera', hook: 'Use real photos of your work.', fact: 'Real photos build trust faster than generic ones.', punch: 'Nobody believes the smiling stranger.' },
  { tag: W, stat: 'Prices', hook: 'Show a starting price.', fact: 'It helps the right customers contact you and saves everyone time.', punch: '"DM for price" is not a price.' },
  { tag: W, motif: 'pin', hook: 'Add your address and a map.', fact: 'Local customers want to know exactly where to find you.', punch: '"Near the big tree" is not an address.' },
  { tag: W, motif: 'hourglass', hook: 'Test your site on a slow connection.', fact: 'Many visitors are on weak networks, so keep pages light.', punch: 'Patience is not a feature.' },
  { tag: W, stat: 'Aa', hook: 'Make the text big enough for a phone.', fact: 'Aim for body text around 16 pixels or larger.', punch: 'Tiny text is a secret nobody wants.' },
  { tag: W, motif: 'bubbles', hook: 'Add a WhatsApp button.', fact: 'Customers can message you in one tap, using an app they already have.', punch: 'Less friction. More orders.' },
  { tag: W, stat: '5', hook: 'Keep your menu to about five links.', fact: 'Short menus make it easier to find what matters.', punch: 'A menu is not a library.' },
  { tag: W, motif: 'clock', hook: 'Update your opening hours when they change.', fact: 'Wrong hours cost you customers and reviews.', punch: 'Locked door. One star.' },

  { tag: B, stat: 'Paper', hook: 'Nokia started as a paper mill.', fact: 'It began making wood pulp and paper in Finland in 1865.', punch: 'From paper to Snake.' },
  { tag: B, stat: 'Cards', hook: 'Nintendo started by making playing cards.', fact: 'It was founded in 1889 in Japan to sell handmade cards.', punch: 'Still dealing in fun.' },
  { tag: B, stat: 'Fish', hook: 'Samsung started as a trading company selling groceries.', fact: 'In 1938 it sold dried fish, vegetables and noodles.', punch: 'Now it sells phones. No noodles.' },
  { tag: B, stat: 'Soap', hook: 'Wrigley first sold soap and baking powder.', fact: 'Chewing gum started as a free gift with those products.', punch: 'The bonus beat the product.' },
  { tag: B, motif: 'coffee', hook: 'Starbucks first sold beans, not drinks.', fact: 'The first Seattle store in 1971 sold coffee beans and equipment.', punch: 'The latte came later.' },
  { tag: B, motif: 'lego', hook: 'LEGO began with wooden toys.', fact: 'Ole Kirk Kristiansen made them in Denmark in the 1930s.', punch: 'Plastic bricks came later.' },
  { tag: B, stat: 'Looms', hook: 'Toyota started by making weaving looms.', fact: 'The company grew out of an automatic loom business.', punch: 'It wove its way into cars.' },
  { tag: B, stat: 'Rice', hook: 'Sony\'s first product was a failed rice cooker.', fact: 'The 1946 start-up tried an electric rice cooker before moving on to electronics.', punch: 'Overcooked idea. Perfect pivot.' },
  { tag: B, stat: '1967', hook: 'The first ATM opened in London in 1967.', fact: 'It was at a Barclays branch in Enfield.', punch: 'Cash on demand. No queue, briefly.' },
  { tag: B, stat: '1904', hook: 'Monopoly began as a protest game.', fact: 'Lizzie Magie patented The Landlord\'s Game in 1904 to show how rent hurts people.', punch: 'It taught the lesson. People bought hotels anyway.' },

  { tag: D, motif: 'dino', hook: 'T. rex lived closer to us than to Stegosaurus.', fact: 'Stegosaurus died out about 80 million years before T. rex appeared.', punch: 'Different eras. Same dramatic teeth.' },
  { tag: D, stat: 'Birds', hook: 'Birds are living dinosaurs.', fact: 'Modern birds descended from small feathered dinosaurs.', punch: 'Your pigeon has a royal past.' },
  { tag: D, stat: '1842', hook: 'The word dinosaur means terrible lizard.', fact: 'Richard Owen coined it in 1842.', punch: 'Rude, but fair.' },
  { tag: D, stat: 'Feathers', hook: 'Many dinosaurs had feathers.', fact: 'Fossils show feather-like coverings on several species.', punch: 'Fierce and fluffy.' },
  { tag: D, stat: '10km', hook: 'An asteroid about 10 km wide ended the dinosaurs.', fact: 'It struck near Chicxulub, Mexico, about 66 million years ago.', punch: 'Worst day ever.' },
  { tag: D, stat: '4,000', hook: 'Woolly mammoths were alive when the pyramids were built.', fact: 'A small group survived on Wrangel Island until about 4,000 years ago.', punch: 'Time travel is weird.' },
  { tag: D, stat: 'Turkey', hook: 'Velociraptors were about the size of a turkey.', fact: 'They were also feathered, unlike the movie version.', punch: 'Less scary. More fluffy.' },
  { tag: D, stat: '7/7', hook: 'Dinosaur fossils have been found on every continent.', fact: 'That includes Antarctica.', punch: 'Even the cold ones got visitors.' },
  { tag: D, stat: '1811', hook: 'Mary Anning found a giant fossil as a child.', fact: 'She and her brother uncovered an ichthyosaur in England around 1811 to 1812.', punch: 'Homework finished early.' },
  { tag: D, stat: '165M', hook: 'Dinosaurs ruled for about 165 million years.', fact: 'Modern humans have been around for roughly 300,000.', punch: 'They had a longer run than us.' },
];
