/**
 * Remark plugin to transform directive syntax (:::) into Admonition components
 * 
 * Supports:
 * :::tip[Title] content :::
 * :::warning[Title] content :::
 * :::danger[Title] content :::
 * :::info[Title] content :::
 * :::note[Title] content :::
 * :::caution[Title] content :::
 */

import type { Root } from 'mdast';
import type { ContainerDirective } from 'mdast-util-directive';
import { visit } from 'unist-util-visit';

const ADMONITION_TYPES = ['tip', 'warning', 'danger', 'info', 'note', 'caution', 'success', 'important'];

export function admonitionRemarkPlugin() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (node.type !== 'containerDirective') return;
      
      const directive = node as ContainerDirective;
      const type = directive.name;
      
      if (!ADMONITION_TYPES.includes(type)) return;

      // Transform to MDX JSX component
      (node as unknown as { type: string; name: string; attributes: Array<{ name: string; value: string }> }).type = 'mdxJsxFlowElement';
      (node as unknown as { name: string }).name = 'Admonition';
      
      const attributes: Array<{ name: string; value: string }> = [
        { name: 'type', value: type },
      ];

      // Extract title from label attribute (:::tip[Title])
      const label = directive.children[0];
      if (label && label.type === 'paragraph' && label.children[0]?.type === 'text') {
        const text = label.children[0].value;
        const match = text.match(/^\[(.+?)\]\s*/);
        if (match) {
          attributes.push({ name: 'title', value: match[1] });
          // Remove the title from content
          label.children[0].value = text.slice(match[0].length);
          // Remove empty paragraph if needed
          if (!label.children[0].value && label.children.length === 1) {
            directive.children.shift();
          }
        }
      }

      (node as unknown as { attributes: Array<{ name: string; value: string }> }).attributes = attributes;
    });
  };
}
