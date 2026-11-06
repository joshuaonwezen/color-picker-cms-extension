import {register} from '@optimizely/cms-extensibility-sdk';

import {ColorField} from './color/ColorField';

// The one property-editor entry; app.yml binds it to long strings (string, no format).
register((context) => <ColorField context={context} />);
