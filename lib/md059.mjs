// @ts-check

import { addErrorContext } from "../helpers/helpers.cjs";
import { getDescendantsByType } from "../helpers/micromark-helpers.cjs";
import { filterByTypesCached } from "./cache.mjs";

const allowedChildrenTypes = new Set([
  "codeText",
  "htmlText"
]);
const defaultBannedTexts = [
  "click here",
  "here",
  "link",
  "more"
];

/**
 * Normalizes a string and removes extra whitespaces and punctuations.
 *
 * @param {string} text String to transform.
 * @returns {string} Normalized string with no punctuations or extra whitespaces.
 */
function normalizeText(text) {
  return text
    .replace(/[\W_]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

/** @type {import("markdownlint").Rule} */
export default {
  "names": [ "MD059", "descriptive-link-text" ],
  "description": "Link text should be descriptive",
  "tags": [ "links", "accessibility" ],
  "parser": "micromark",
  "function": function MD059(params, onError) {
    const bannedTexts = new Set(params.config.link_texts || defaultBannedTexts);
    const links = filterByTypesCached([ "link" ]);
    for (const link of links) {
      const labelTexts = getDescendantsByType(link, [ "label", "labelText" ]);
      for (const labelText of labelTexts) {
        const { children, endColumn, endLine, parent, startColumn, startLine, text } = labelText;
        if (
          !children.some((child) => allowedChildrenTypes.has(child.type)) &&
          bannedTexts.has(normalizeText(text))
        ) {
          const range = (startLine === endLine) ?
            [ startColumn, endColumn - startColumn ] :
            undefined;
          addErrorContext(
            onError,
            startLine,
            // @ts-ignore
            parent.text,
            undefined,
            undefined,
            range
          );
        }
      }
    }
  }
};
