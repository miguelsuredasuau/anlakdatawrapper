import Changelog from './Changelog.svelte';
import { renderWithContext, setConfig } from '../../../../tests/helpers/clientUtils';
import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';
import { MockAgent, setGlobalDispatcher } from 'undici';

setConfig({ testIdAttribute: 'data-uid' });

chai.use(chaiDom);

const testFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:wfw="http://wellformedweb.org/CommentAPI/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:atom="http://www.w3.org/2005/Atom"
    xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
    xmlns:slash="http://purl.org/rss/1.0/modules/slash/">
    <channel>
        <title>Datawrapper - Changelogs</title>
        <atom:link href="https://www.datawrapper.de/feed/changelogs" rel="self" type="application/rss+xml" />
        <link>https://www.datawrapper.de/changelog</link>
        <description>Datawrapper changelogs</description>
        <item>
            <title><![CDATA[2017-10-12 / mycharts]]></title>
            <description><![CDATA[<p>Rebuild My Charts and Team charts page.</p>]]></description>
            <link>https://www.datawrapper.de/changelog#2017-10-12-mycharts</link>
            <guid isPermaLink="false">2017-10-12-mycharts</guid>
            <pubDate>Thu, 12 Oct 2017 00:00:00 +0000</pubDate>
        </item>
        <item>
            <title><![CDATA[2017-09-22 / range plot, arrow plot]]></title>
            <description><![CDATA[<p>Added two new visualization types: <a href="https://blog.datawrapper.de/new-arrow-and-range-plots/" target="_blank" rel="noopener">arrow plots and range plots</a>.</p>]]></description>
            <link>https://www.datawrapper.de/changelog#2017-09-22-range-plot,-arrow-plot</link>
            <guid isPermaLink="false">2017-09-22-range-plot,-arrow-plot</guid>
            <pubDate>Fri, 22 Sep 2017 00:00:00 +0000</pubDate>
        </item>
    </channel>
</rss>
	`;

describe('Changelog', () => {
    describe('initial state, no feed', function () {
        it('renders changelog', async () => {
            const changelogUrl = 'https://www.datawrapper.de/changelog';
            const result = await renderWithContext(Changelog, {
                __: d => d,
                changelogUrl
            });
            const title = await result.findByText('dashboard / changelog');

            expect(title).to.exist;
            expect(title).to.have.attribute('href', changelogUrl);
        });
    });

    describe('initial state, with feed', function () {
        const agent = new MockAgent();
        setGlobalDispatcher(agent);
        const client = agent.get('http://datawrapper.mock');
        client.intercept({ path: '/changelog.xml' }).reply(200, testFeed);

        it('renders changelog', async () => {
            const changelogUrl = 'https://www.datawrapper.de/changelog';
            const result = await renderWithContext(Changelog, {
                __: d => d,
                changelogUrl,
                changelogFeed: 'http://datawrapper.mock/changelog.xml'
            });

            const items = await result.findAllByTestId('changelog-item');

            expect(items).to.exist;
            expect(items).to.have.length(2);

            const contents = items.map(item => item.querySelector('.content'));

            expect(contents[0]).to.have.trimmed.text('Rebuild My Charts and Team charts page.');
            expect(contents[1]).to.have.trimmed.text(
                'Added two new visualization types: arrow plots and range plots.'
            );
        });
    });
});
