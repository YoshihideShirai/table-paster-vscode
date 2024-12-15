let rxTag = new RegExp(
	/<([a-z][a-z0-9]*|o:p)(|\s[^>]*)>|<\/([a-z][a-z0-9]*|o:p)>|<!--(?:.*?)-->/,
	'gmi'
);

let rxTagForEscape = new RegExp(
	/<([a-z][a-z0-9]*|o:p)(|\s[^>]*)>|<\/([a-z][a-z0-9]*|o:p)>|<!--(?:.*?)-->/,
	'gmi'
);

let rxAttr = new RegExp(
	/\b([^\x00-\x1F\x20\x22\x27\x2F\x3D\x3E]+)\s*(?:=\s*(?:([^\x20\x22\x27\x3C\x3D\x3E\x60]+)|'([^']*)'|\x22([^x22]*)\x22))?/,
	'gmi'
);

function parseAttrs(attrsStr: string) {
	let dict: { [key: string]: string } = {};

	let mAttr;
	while ((mAttr = rxAttr.exec(attrsStr)) !== null) {
		let key = mAttr[1].toLowerCase();

		let value = "";
		if (mAttr[2] && mAttr[2].length > 0) {
			value = mAttr[2];
		}
		else if (mAttr[3] && mAttr[3].length > 0) {
			value = mAttr[3];
		}
		else if (mAttr[4] && mAttr[4].length > 0) {
			value = mAttr[4];
		}
		else { // without "="
			// do nothing
		}

		dict[key] = value;
	}
	return dict;
}

function EscapeContentForAdocTableCell(s: string) {
	// Replace (string input, string replacement);
	s = s.replace(rxTagForEscape, ''); // HTML全般のタグを消去
	s = s.replace(/\r(?:\n?)|\t/gm, ' ').
		replace(/&nbsp;/, ' ').
		replace(/&lt;/, '<').
		replace(/&gt;/, '>').
		replace(/&amp;/, '&').
		replace(/\|/, '{VBar}'); // ADoc用
	return s;
}

function parseHtmlTextAndConvertToAdoc(tableText: string) {
	let sb = '|===\n';

	let lastStartTag = null;
	let lastPos = -1;
	let lastTdPos = -1;
	let currentTdCount = 0;
	let infLoopCheckCount = 1000000; // for debug

	let m;
	while ((m = rxTag.exec(tableText)) !== null) {
		infLoopCheckCount--;
		if (infLoopCheckCount <= 0) { return; }
		//console.log(m[1]);
		if (m[1] && m[1].length > 0) {
			let tag = m[1];
			let attrsStr = m[2];
			lastPos = rxTag.lastIndex;

			if (tag === 'tr') {
				currentTdCount = 0;
			}
			else if (tag === 'td') {
				lastTdPos = lastPos;
				if (lastStartTag !== 'tr') {
					sb += ' ';
				}
				let attrs = parseAttrs(attrsStr);
				if (attrs['colspan'] || attrs['rowspan']) {
					if (attrs['colspan']) {
						sb += attrs['colspan'];
					}
					if (attrs['rowspan']) {
						sb += '.';
						sb += attrs['rowspan'];
					}
					sb += '+';
				}
				sb += '|';
				currentTdCount++;
			}
			lastStartTag = tag;
		}
		else if (m[3] && m[3].length > 0) {
			let tag = m[3];
			let tagStartPos = rxTag.lastIndex - m[0].length;
			if (tag === 'tr') {
				sb += '\n';
			}
			else if (tag === 'td') {
				let s = tableText.substring(lastTdPos, tagStartPos);
				//console.log(s);
				sb += EscapeContentForAdocTableCell(s);
				lastTdPos = -1;
			}
			lastPos = -1;
			lastStartTag = null;
		}
	}

	sb += '|===\n';

	return sb;
}

function tableConverter(languageId: string, htmltable: string): string {
	if (languageId === "asciidoc") {
		return parseHtmlTextAndConvertToAdoc(htmltable) ?? "";
	}
	return htmltable;
}

export { tableConverter };