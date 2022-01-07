// ==UserScript==
// @name         Odspermiacz
// @namespace    VVadovice
// @version      0.2136
// @description  Oczyszcza wypok ze spermy
// @author       Jan Paweł II
// @match        https://www.wykop.pl/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(async function() {
    'use strict';

    const its_NOT_OkToBeWhite = true;
    const spareFollowed = true;


    async function getFollowedList() {
        const req = await fetch(`https://www.wykop.pl/moj/`);
        const html = await req.text();
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');
        return [...dom.querySelectorAll('#observedUsers span:not(.red)')].map(e => e.textContent);
    }
    const followedList = spareFollowed ? await getFollowedList() : [];

    const isNotFollowed = img => !followedList.includes(getLogin(img));
    const getLogin = img => img.alt || img.parentNode.href.split('/').at(-2);

    const semenSelector = its_NOT_OkToBeWhite ? 'li img.avatar:not(.female)' : 'li img.male';
    const seekSperma = (node=document) => [...node.querySelectorAll(semenSelector)].filter(isNotFollowed);
    const destroy = spermatozoid => spermatozoid.closest('li').remove();
    const applySpermicide = (node=document) => seekSperma(node).forEach(destroy);

    applySpermicide();
    const targetNode = document;
    const config = { attributes: false, childList: true, subtree: true };
    const callback = function(mutationsList, observer) {
        for(const mutation of mutationsList) {
            applySpermicide(mutation.target);
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
})();
