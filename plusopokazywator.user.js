// ==UserScript==
// @name         Plusopokazywator
// @namespace    VVadovice
// @version      0.2136
// @description  mihau dlaczego ლ(ಠ_ಠ ლ)
// @author       Jan Paweł II
// @match        https://wykop.pl/*
// ==/UserScript==

(function () {
    'use strict';

    async function fetchVoters(entry) {
        const ids = entry.resource === 'entry' ? `${entry.id}` : `${entry.parent.id}/comments/${entry.id}`;
        const req = await fetch(
            `https://wykop.pl/api/v3/entries/${ids}/votes`,
            {"headers": {"Authorization": `Bearer ${localStorage.getItem('token')}`}}
        );
        const resp = await req.json();
        return resp.data;
    }


    async function moreClick(event) {
        event.preventDefault();
        const entry = event.target.closest(`section.entry`).__vue__.item;
        const voters = await fetchVoters(entry);
        const votersSection = event.target.closest('.entry-votes');
        votersSection.outerHTML = votersHTML(entry, voters);
    }


    function voterHTML(voter) {
        return `
            <li>
				<a href="/ludzie/${voter.username}">
				    <span>${voter.username}</span>
				</a>
			</li>`;
    }


    function votersHTML(entry, voters) {
        const votesDiff = entry.votes.up - voters.length;
        return `
            <section class="entry-votes">
                <ul>
                    ${voters.map(voterHTML).join(' ')}
                </ul>
                ${votesDiff > 0 ? `<span class="more">+${votesDiff} INNYCH</span>` : ''}
            </section>`;
    }


    function showFiveVoters(entryNode) {
        const entry = entryNode.__vue__.item;
        if (entry.votes.up && !entry.votes.down) {
            const footer = entryNode.firstElementChild.querySelector("footer");
            footer?.insertAdjacentHTML("beforebegin", votersHTML(entry, entry.votes.users));
            footer?.parentNode.querySelector('span.more')?.addEventListener("click", moreClick);
        }
    }


    document.head.insertAdjacentHTML("beforeend", `<style>
    section.entry-votes {
        display: flex;
        color: var(--gullGray);
        font-size: 12px;
        margin-top: 12px;

        ul {
            display: flex;
            flex-wrap: wrap;
            list-style-type: none;
            padding: 0 0 0 0;
            margin: 0;
            column-gap: 4px;
            row-gap: 1px;

            &::before {content: "Plusujący: "}

            li:not(:last-of-type) a span::after {content: ","}
        }

        span.more {
            cursor: pointer;
            font-weight: 700;
            margin-left: 4px;
        }
    } </style>`);


    (new MutationObserver(() => {
        for (const node of document.querySelectorAll('section[id].entry:not(:has(.entry-votes))')) {
            showFiveVoters(node);
        }
    })).observe(document.querySelector('main'), {childList: true, subtree: true});
})();
