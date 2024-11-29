import { Pane } from 'tweakpane';

export class DevPanel extends Pane {
    constructor() {
        super();
        if (import.meta.env.PROD) {
            throw Error(
                'The DevPanel should not be instantiated in the production environment.',
            );
        }
    }
}
