import Index from './Index.svelte';
import { tick } from 'svelte';
import { loadLocales } from '../../../tests/helpers/setup-locales.mjs';
import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';
import { renderWithContext, setConfig } from '../../../tests/helpers/clientUtils';

setConfig({ testIdAttribute: 'data-uid' });

chai.use(chaiDom);

const props = {
    apiQuery: {
        groupBy: null,
        limit: 96,
        offset: 0,
        search: '',
        order: 'DESC',
        minLastEditStep: 2,
        orderBy: 'lastModifiedAt'
    },
    charts: { list: [], total: 0 },
    teamId: undefined,
    folderId: undefined,
    folders: {
        $user: {
            id: null,
            key: '$user',
            teamId: null,
            parentId: null,
            name: 'My archive',
            chartCount: 0
        }
    },
    teams: [],
    minLastEditStep: 2,
    themeBgColors: {}
};

describe('archive', () => {
    before(async () => {
        await loadLocales();
    });

    describe('with no folders and charts', function () {
        let renderResult;

        beforeEach(async () => {
            renderResult = await renderWithContext(Index, props);
        });

        it('search input should exist', () => {
            renderResult.getByPlaceholderText('Search').should.exist;
        });

        it('search folders should exist', () => {
            const searchFolders = renderResult.container.querySelectorAll('.folder.is-search');
            expect(searchFolders.length).to.equal(2);
        });
    });

    describe('with folders', () => {
        let renderResult;

        beforeEach(async () => {
            renderResult = await renderWithContext(Index, {
                ...props,
                folders: {
                    $user: {
                        id: null,
                        key: '$user',
                        teamId: null,
                        parentId: null,
                        name: 'My archive',
                        chartCount: 0,
                        path: '/archive'
                    },
                    1: {
                        id: 1,
                        key: 1,
                        teamId: null,
                        parentId: null,
                        name: 'Folder 1',
                        chartCount: 0,
                        path: '/archive/1'
                    },
                    2: {
                        id: 2,
                        key: 2,
                        teamId: null,
                        parentId: null,
                        name: 'Folder 2',
                        chartCount: 0,
                        path: '/archive/2'
                    }
                }
            });
            await tick();
            // console.log(test.container.outerHTML); // uncomment to print the generated html
        });

        it('loads the initial page correctly', () => {
            // current folder
            const elements = renderResult.getAllByText('My archive');
            expect(elements.length).to.equal(2);

            // folder subgrid
            renderResult.getByText('Folder 1').should.exist;
            renderResult.getByText('Folder 2').should.exist;

            // new button
            renderResult.getByText('New').should.exist;
            renderResult.getByPlaceholderText('Search').should.exist;
        });

        it('should open the folder tree correctly', async () => {
            const rootFolder = renderResult.container.querySelector('.folder:not(.is-search)');
            const btn = rootFolder.getElementsByTagName('button')[0];
            btn.click();
            await tick();
            renderResult.getAllByText('Folder 1').length.should.be.equal(2);
            renderResult.getAllByText('Folder 2').length.should.be.equal(2);
        });
    });
});
