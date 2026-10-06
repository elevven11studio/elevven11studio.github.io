/**
 * Adds three content sections to every demo template: reasons to choose, client
 * quotes, and common questions.
 *
 * The demos were three sections long, which read as a wireframe rather than a
 * finished site - the thing a customer is being asked to buy. These sections
 * are what a real small-business site carries, so the demo argues the case
 * better.
 *
 * Everything is styled from each demo's OWN custom properties (--accent, --bg,
 * --muted, --text, all present in all 42), so the additions inherit each
 * template's palette instead of imposing one. --card only exists in 22 of them,
 * so it is always used with a fallback.
 *
 *   cd tools && npm run enhance-demos
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXAMPLES = path.join(ROOT, 'examples');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Content per industry. Business names stay fictional - the footer on every
   demo already says so. */
const C = {
  barber: {
    why: [['Master barbers', 'Every cut is done by a trained barber with years behind the chair, not a trainee.'],
      ['Walk-ins welcome', 'Booked out? We keep slots free each day for walk-ins, first come first served.'],
      ['Clean and sterilised', 'Fresh blades, sterilised clippers and a clean cape for every single client.']],
    quotes: [['Best fade I have had in Lagos. They took their time and got the line-up perfect.', 'Tunde A.', 'Regular since 2024'],
      ['I bring both my sons here. Quick, friendly, and they are good with kids.', 'Mrs Adaeze O.', 'Parent']],
    faq: [['Do I need an appointment?', 'No, walk-ins are welcome. Booking ahead just means you skip the wait, especially on Fridays and Saturdays.'],
      ['How long does a cut take?', 'A standard fade takes about 40 minutes. A fade and beard combo takes around an hour.'],
      ['What payment do you accept?', 'Cash and bank transfer. Transfers are confirmed before you leave the chair.']],
  },
  restaurant: {
    why: [['Cooked to order', 'Nothing sits under a lamp. Every plate is cooked when you order it.'],
      ['Local ingredients', 'We buy fresh from the market each morning, so the menu follows what is good that day.'],
      ['Pickup and delivery', 'Order ahead for pickup, or have it delivered within the area.']],
    quotes: [['The jollof is the real thing. Smoky, proper party jollof, not the watery version.', 'Chinedu E.', 'Ordered 12 times'],
      ['We order lunch for the whole office every Friday. Always on time, always hot.', 'Blessing N.', 'Office manager']],
    faq: [['Do you deliver?', 'Yes, within the local area. Message us with your address and we will confirm the fee before you pay.'],
      ['Can I order for an event?', 'We cater for events and large orders. Give us 48 hours notice so we can shop for it properly.'],
      ['Do you have vegetarian options?', 'Several. Ask when you order and we will tell you what is meat-free that day.']],
  },
  fashion: {
    why: [['Made to measure', 'Pieces are cut to your measurements, not pulled off a rack in a standard size.'],
      ['Quality fabric', 'We source fabric ourselves and will show you the material before any cutting starts.'],
      ['Fittings included', 'Two fittings come with every order, so the final piece actually fits.']],
    quotes: [['The fit was perfect first time. I have worn it to three weddings already.', 'Amaka U.', 'Custom order'],
      ['They understood exactly what I wanted from one photo. Beautiful finishing.', 'Ifeoma K.', 'Bridal client']],
    faq: [['How long does an order take?', 'Two to three weeks for most pieces. Bridal and heavily beaded work takes longer.'],
      ['Can you work from a picture?', 'Yes. Send a reference and we will tell you honestly what is achievable in the fabric you want.'],
      ['Do you ship?', 'We ship nationwide. Delivery is arranged once the final fitting is done.']],
  },
  photographer: {
    why: [['Full-day coverage', 'Booking covers the whole event, not a fixed number of hours with overtime charges.'],
      ['Edited gallery', 'Every delivered image is colour-corrected and retouched, not straight off the camera.'],
      ['Backup equipment', 'Two bodies and spare cards on every shoot. A failure never costs you the day.']],
    quotes: [['He caught moments we did not even know happened. The gallery made us cry.', 'Seyi and Tolu', 'Wedding, 2025'],
      ['Professional from the first call to delivery. Photos arrived when promised.', 'Kunle B.', 'Corporate shoot']],
    faq: [['How long until I get my photos?', 'A preview set within 48 hours, and the full edited gallery within three weeks.'],
      ['Do you travel?', 'Yes, nationwide. Travel and accommodation are quoted separately and agreed upfront.'],
      ['Do we get the raw files?', 'Edited images are what we deliver. Raw files can be discussed for an additional fee.']],
  },
  church: {
    why: [['Everyone is welcome', 'Come as you are. There is no dress code and no expectation on a first visit.'],
      ['Small groups', 'Midweek groups meet across the city, so you can find people near you.'],
      ['Community outreach', 'Practical support for families in the area, run by volunteers from the congregation.']],
    quotes: [['We visited once and stayed. The welcome was genuine, not a performance.', 'The Okafor family', 'Members since 2023'],
      ['The youth programme has been good for my children in a way I did not expect.', 'Grace A.', 'Parent']],
    faq: [['What time are services?', 'Sunday mornings, with a midweek evening service. Times are listed above.'],
      ['Is there anything for children?', 'Yes, a supervised childrens programme runs during the main service.'],
      ['Do I have to give?', 'No. Giving is voluntary and never a condition of attending.']],
  },
  school: {
    why: [['Small class sizes', 'Classes are capped so every student gets attention rather than sitting at the back.'],
      ['Qualified teachers', 'Every tutor is subject-qualified and vetted before they teach a single class.'],
      ['Progress reports', 'Parents receive written progress updates, not just a grade at the end of term.']],
    quotes: [['My daughter went from struggling to confident in one term. The reports kept us informed.', 'Mr Adewale', 'Parent'],
      ['The teachers actually explain things until you understand. That made the difference.', 'Zainab M.', 'Former student']],
    faq: [['When does enrolment open?', 'Enrolment runs before each term. Contact us for current dates and available places.'],
      ['Do you offer weekend classes?', 'Yes, weekend sessions are available for students who cannot attend on weekdays.'],
      ['How are fees paid?', 'Termly, by bank transfer. A payment plan can be arranged on request.']],
  },
  fitness: {
    why: [['Programmes, not guesswork', 'You get a written plan built around your goal, reviewed as you progress.'],
      ['Beginners welcome', 'Most people who start here have never trained before. Nobody is judged.'],
      ['Flexible sessions', 'Morning, evening and weekend slots, so training fits around work.']],
    quotes: [['I lost 12kg in five months and kept it off. The plan was realistic, not extreme.', 'Emeka O.', 'Client, 8 months'],
      ['First gym where I did not feel out of place on day one.', 'Halima S.', 'Client, 4 months']],
    faq: [['Do I need to be fit to start?', 'No. Programmes start from wherever you are and build up from there.'],
      ['Is nutrition included?', 'Basic nutrition guidance is included. Detailed meal planning is available separately.'],
      ['Can I freeze my membership?', 'Yes, for travel or injury. Let us know and we will pause it.']],
  },
  consultant: {
    why: [['Clear scope', 'Every engagement starts with a written scope, so you know what you are paying for.'],
      ['Practical output', 'You get decisions and next steps, not a slide deck nobody reads.'],
      ['Direct access', 'You work with me, not a junior assigned after the pitch.']],
    quotes: [['Cut through a decision we had been stuck on for months in two sessions.', 'Ngozi A.', 'Operations director'],
      ['Honest advice, including telling us not to spend money we were about to spend.', 'David I.', 'Founder']],
    faq: [['How do engagements work?', 'A short discovery call first, then a written proposal with scope, timeline and cost.'],
      ['Do you work with small businesses?', 'Yes. Scope is sized to the business, not the other way round.'],
      ['What are your rates?', 'Quoted per engagement rather than hourly, so the cost is known before we start.']],
  },
  events: {
    why: [['One point of contact', 'You deal with one planner from first call to pack-down, not a rotating team.'],
      ['Vendors we trust', 'We only book suppliers we have worked with, so nothing arrives unproven on the day.'],
      ['Contingency planned', 'Every event has a written backup for weather, power and timing.']],
    quotes: [['Everything ran on schedule and we actually enjoyed our own wedding.', 'Fola and Ada', 'Wedding, 2025'],
      ['They handled a 300-guest event without a single thing reaching me on the day.', 'Chuka N.', 'Corporate client']],
    faq: [['How far ahead should I book?', 'Three to six months for a large event. Smaller events can be arranged in weeks.'],
      ['Do you handle vendors?', 'Yes, sourcing, booking and managing suppliers is part of the service.'],
      ['What is the deposit?', 'A deposit secures the date, with the balance staged before the event.']],
  },
  logistics: {
    why: [['Tracked from pickup', 'Every item is logged at pickup and you get updates until it is signed for.'],
      ['Same-day options', 'Within-city deliveries can go same day when booked before midday.'],
      ['Insured handling', 'Goods are covered in transit. Declared value is agreed before pickup.']],
    quotes: [['We moved to them after two failed deliveries elsewhere. No issues since.', 'Ifeanyi C.', 'E-commerce seller'],
      ['They call before they arrive, which sounds small but nobody else does it.', 'Bola T.', 'Regular customer']],
    faq: [['What areas do you cover?', 'Within the city same day, and nationwide on a next-day or scheduled basis.'],
      ['How is pricing worked out?', 'By weight, size and distance. You get the price before we collect.'],
      ['What if something is damaged?', 'Declare the value at booking and covered items are compensated per our terms.']],
  },
  'real-estate': {
    why: [['Verified listings', 'Every property is inspected and documents checked before it goes on the list.'],
      ['No wasted viewings', 'We match you to properties that fit your budget and needs before arranging visits.'],
      ['Support through closing', 'Guidance on documents, payment stages and handover, not just the introduction.']],
    quotes: [['They told me which property to walk away from. That saved me a lot.', 'Uche O.', 'Buyer, 2025'],
      ['Rented within two weeks, and the paperwork was actually in order.', 'Aisha B.', 'Tenant']],
    faq: [['Do you charge for viewings?', 'No. Fees apply only on a completed transaction and are stated upfront.'],
      ['Are documents verified?', 'Yes, title documents are checked before we list a property.'],
      ['Do you handle rentals?', 'Both sales and rentals, including renewals and inspections.']],
  },
  freelancer: {
    why: [['Fixed quotes', 'You get a price for the work, not an hourly meter running in the background.'],
      ['Direct communication', 'You talk to the person doing the work, so nothing gets lost in translation.'],
      ['Delivered on time', 'Deadlines are agreed before starting and treated as commitments.']],
    quotes: [['Delivered ahead of schedule and handled two revisions without complaint.', 'Tobi A.', 'Startup founder'],
      ['Understood the brief immediately. The first draft was already close.', 'Ruth E.', 'Marketing lead']],
    faq: [['How do we start?', 'Send a brief. You get a quote and a timeline before any work begins.'],
      ['How many revisions?', 'Two rounds are included. Further changes are quoted separately.'],
      ['How is payment handled?', 'Part upfront to secure the slot, balance on delivery.']],
  },
  portfolio: {
    why: [['Selected work', 'A focused selection rather than everything ever made, so the standard stays high.'],
      ['Process shared', 'Each project explains the thinking, not just the finished image.'],
      ['Available for work', 'Currently taking on new projects. Timelines discussed upfront.']],
    quotes: [['Understood the brand better than we did after one conversation.', 'Kemi L.', 'Client'],
      ['Rare combination of good taste and actually hitting deadlines.', 'Segun D.', 'Creative director']],
    faq: [['What kind of work do you take?', 'Projects where the brief is clear and there is room to do it properly.'],
      ['What is your process?', 'Brief, concepts, one direction developed, then refinement to final delivery.'],
      ['How do I get a quote?', 'Send an outline of the project and a rough budget, and you will get an honest answer.']],
  },
  'small-business': {
    why: [['Local and reachable', 'A real business with a real address, not an anonymous online shopfront.'],
      ['Fair pricing', 'Prices are listed and quoted upfront, with no charges appearing later.'],
      ['Repeat customers', 'Most of our work comes from people who came back or recommended us.']],
    quotes: [['Straightforward to deal with and they did what they said they would.', 'Musa I.', 'Customer'],
      ['I have used them three times now. Consistent every time.', 'Ngozi P.', 'Repeat customer']],
    faq: [['What are your opening hours?', 'Listed above. Message us outside those hours and we will reply next working day.'],
      ['Do you offer quotes?', 'Yes, quotes are free and given before any work is agreed.'],
      ['How can I pay?', 'Cash and bank transfer. A receipt is issued for every payment.']],
  },
};

const CSS = `
		/* ---- added content sections ---- */
		.e11-x { padding: 4.5rem 0; }
		.e11-x-intro { max-width: 640px; margin: 0 auto 2.75rem; text-align: center; color: var(--muted); }
		.e11-x-rule { width: 64px; height: 3px; border-radius: 2px; background: var(--accent); margin: 0 auto 1.5rem; }
		.e11-x-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
		.e11-x-card {
			background: var(--card, rgba(127, 127, 127, 0.08));
			border: 1px solid rgba(127, 127, 127, 0.22);
			border-radius: 14px;
			padding: 1.75rem;
		}
		.e11-x-card h3 { font-size: 1.08rem; margin-bottom: 0.6rem; color: var(--text); }
		.e11-x-card p { color: var(--muted); font-size: 0.95rem; line-height: 1.65; }
		.e11-x-num {
			display: inline-flex; align-items: center; justify-content: center;
			width: 34px; height: 34px; border-radius: 50%;
			background: var(--accent); color: var(--bg);
			font-weight: 700; font-size: 0.9rem; margin-bottom: 1rem;
		}
		.e11-quotes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
		.e11-quote {
			background: var(--card, rgba(127, 127, 127, 0.08));
			border-left: 3px solid var(--accent);
			border-radius: 10px;
			padding: 1.75rem;
		}
		.e11-quote p { color: var(--text); font-size: 1.02rem; line-height: 1.7; margin-bottom: 1rem; }
		.e11-quote .who { color: var(--accent); font-weight: 700; font-size: 0.92rem; }
		.e11-quote .role { color: var(--muted); font-size: 0.85rem; }
		.e11-faq { max-width: 760px; margin: 0 auto; }
		.e11-faq-item { border-bottom: 1px solid rgba(127, 127, 127, 0.22); padding: 1.35rem 0; }
		.e11-faq-item h3 { font-size: 1.02rem; margin-bottom: 0.5rem; color: var(--text); }
		.e11-faq-item p { color: var(--muted); font-size: 0.95rem; line-height: 1.65; }
		@media (max-width: 700px) {
			.e11-x-grid, .e11-quotes { grid-template-columns: 1fr; }
		}`;

function sections(c) {
  const why = c.why.map(([t, d], i) =>
    `				<div class="e11-x-card">
					<div class="e11-x-num">${i + 1}</div>
					<h3>${esc(t)}</h3>
					<p>${esc(d)}</p>
				</div>`).join('\n');

  const quotes = c.quotes.map(([q, n, r]) =>
    `				<div class="e11-quote">
					<p>&ldquo;${esc(q)}&rdquo;</p>
					<div class="who">${esc(n)}</div>
					<div class="role">${esc(r)}</div>
				</div>`).join('\n');

  const faq = c.faq.map(([q, a]) =>
    `			<div class="e11-faq-item">
				<h3>${esc(q)}</h3>
				<p>${esc(a)}</p>
			</div>`).join('\n');

  return `
	<section class="e11-x">
		<div class="wrap">
			<div class="e11-x-rule"></div>
			<h2 class="section-title">Why people choose us</h2>
			<div class="e11-x-grid">
${why}
			</div>
		</div>
	</section>

	<section class="e11-x">
		<div class="wrap">
			<div class="e11-x-rule"></div>
			<h2 class="section-title">What clients say</h2>
			<div class="e11-quotes">
${quotes}
			</div>
		</div>
	</section>

	<section class="e11-x">
		<div class="wrap">
			<div class="e11-x-rule"></div>
			<h2 class="section-title">Common questions</h2>
			<div class="e11-faq">
${faq}
			</div>
		</div>
	</section>
`;
}

const slugs = fs.readdirSync(EXAMPLES, { withFileTypes: true })
  .filter((d) => d.isDirectory()).map((d) => d.name);

let done = 0, skipped = 0;
const missing = new Set();

for (const slug of slugs) {
  const file = path.join(EXAMPLES, slug, 'index.html');
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('e11-x')) { skipped++; continue; }

  const industry = slug.replace(/-[23]$/, '');
  const c = C[industry];
  if (!c) { missing.add(industry); continue; }

  const before = s;
  s = s.replace(/(\n\t<\/style>)/, CSS + '$1');
  if (s === before) s = s.replace(/(\n\t*<\/style>)/, CSS + '$1');
  s = s.replace(/(\n\t<section class="contact">)/, sections(c) + '$1');

  if (s === before) { console.error('  no anchor: ' + slug); continue; }
  fs.writeFileSync(file, s, 'utf8');
  done++;
}

console.log('demos enhanced : ' + done);
if (skipped) console.log('already done   : ' + skipped);
if (missing.size) { console.error('NO CONTENT for : ' + [...missing].join(', ')); process.exitCode = 1; }
