import {
    Editor,
    EditorPosition,
    EditorSuggest,
    EditorSuggestContext,
    EditorSuggestTriggerInfo,
    Plugin,
    TFile
} from "obsidian";
import {
    loremIpsum
} from "lorem-ipsum"

export default class LoremIpsumPlugin extends Plugin {

    async onload() {
    
        this.registerEditorSuggest(new LoremSuggest(this.app));

    }

}

interface LoremSuggestion {
    amount: number;
}

class LoremSuggest extends EditorSuggest<LoremSuggestion> {
    /**
     * EditorSuggestion for /lorem num to generate a custom amount of Lorem Ipsum
     */

    private defaultCount: number = 100;
    private maxCount: number = 10000;

    onTrigger(cursor: EditorPosition, editor: Editor, file: TFile | null): EditorSuggestTriggerInfo | null {

        const line = editor.getLine(cursor.line);
        const beforeCursor = line.substring(0, cursor.ch);

        // Trigger when !lorem num is entered
        const match = beforeCursor.match(/!lorem(\d*)$/);

        if (match) {

            return {
                start: {
                    line: cursor.line,
                    ch: cursor.ch - match[0].length
                },
                end: cursor,
                query: match[0]
            };

        }
        return null;
        
    }

    getSuggestions(context: EditorSuggestContext): LoremSuggestion[] | Promise<LoremSuggestion[]> {
     
        const match = context.query.match(/^!lorem(\d*)$/);

        if (!match) {
            return [];
        }

        // Ensure number or default
        const amount = match[1] ? Number(match[1]) : this.defaultCount;

        if (amount <= 0 || amount > this.maxCount) {
            return [];
        }

        return [{amount}];

    }

    renderSuggestion(value: LoremSuggestion, el: HTMLElement): void {
        
        el.createEl("div", {
            text: `Generate ${value.amount} words of Lorem Ipsum`
        });

    }

    selectSuggestion(value: LoremSuggestion, evt: MouseEvent | KeyboardEvent): void {
        
        if(!this.context){ return; }
        
        // Generate the amount of Lorem ipsum
        const editor = this.context.editor;

        const lorem = loremIpsum({count: value.amount, units: "words"});

        editor.replaceRange(lorem, this.context.start, this.context.end);

        return;

    }

}