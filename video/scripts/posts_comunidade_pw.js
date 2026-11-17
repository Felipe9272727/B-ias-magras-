const {chromium} = require('playwright');
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({locale: 'pt-BR'});
  for (const id of process.argv.slice(2)) {
    await pg.goto('https://www.youtube.com/post/' + id, {waitUntil: 'domcontentloaded', timeout: 60000});
    await pg.waitForTimeout(4000);
    try { await pg.click('button:has-text("Aceitar tudo"), button:has-text("Accept all")', {timeout: 3000}); await pg.waitForTimeout(2000); } catch {}
    let last = 0;
    for (let i = 0; i < 25; i++) {
      await pg.mouse.wheel(0, 4000); await pg.waitForTimeout(1500);
      const n = await pg.locator('ytd-comment-thread-renderer').count();
      if (n === last && i > 6) break; last = n;
    }
    // abre respostas
    const bt = pg.locator('ytd-comment-replies-renderer #more-replies button');
    for (let i = 0; i < await bt.count(); i++) { try { await bt.nth(i).click({timeout: 2000}); await pg.waitForTimeout(1200); } catch {} }
    const cs = await pg.$$eval('ytd-comment-thread-renderer', (ts) => ts.map((t) => {
      const g = (el) => ({a: el.querySelector('#author-text')?.innerText.trim(), t: el.querySelector('#content-text')?.innerText.trim(), l: el.querySelector('#vote-count-middle')?.innerText.trim()});
      const top = t.querySelector('#comment') ? g(t.querySelector('#comment')) : {};
      const reps = [...t.querySelectorAll('ytd-comment-replies-renderer ytd-comment-view-model, ytd-comment-replies-renderer ytd-comment-renderer')].map(g);
      return {...top, reps};
    }));
    console.log('=========== POST', id, cs.length, 'comentários');
    for (const c of cs) { console.log(`[${c.a} | ${c.l || 0}] ${c.t}`); for (const r of c.reps) console.log(`    -> [${r.a} | ${r.l || 0}] ${r.t}`); }
  }
  await b.close();
})();
