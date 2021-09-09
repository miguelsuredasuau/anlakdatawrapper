import './static/vendor/bootstrap/css/bootstrap.css';
import './static/vendor/bootstrap/css/bootstrap-responsive.css';
import './static/css/datawrapper.css';
import './static/vendor/font-awesome/css/font-awesome.min.css';
import './static/vendor/iconicfont/css/iconmonstr-iconic-font.min.css';

import AlertDisplayDocs from '../AlertDisplay.mdx';
import AlertDisplayView from './AlertDisplayView.svelte';
import DropdownControlDocs from '../DropdownControl.mdx';
import DropdownControlView from './DropdownControlView.svelte';
import DropdownInputDocs from '../DropdownInput.mdx';
import DropdownInputView from './DropdownInputView.svelte';
import IconButtonDocs from '../IconButton.mdx';
import IconButtonView from './IconButtonView.svelte';
import IconDisplayDocs from '../IconDisplay.mdx';
import IconDisplayView from './IconDisplayView.svelte';
import MoreOptionsGroupDocs from '../MoreOptionsGroup.mdx';
import MoreOptionsGroupView from './MoreOptionsGroupView.svelte';
import NumberControlDocs from '../NumberControl.mdx';
import NumberControlView from './NumberControlView.svelte';
import IconButtonBarView from './IconButtonBarView.svelte';
import NumberInputDocs from '../NumberInput.mdx';
import NumberInputView from './NumberInputView.svelte';
import RadioControlDocs from '../RadioControl.mdx';
import RadioControlView from './RadioControlView.svelte';
import SelectControlDocs from '../SelectControl.mdx';
import SelectControlView from './SelectControlView.svelte';
import SnackbarDisplayDocs from '../SnackbarDisplay.mdx';
import SnackbarDisplayView from './SnackbarDisplayView.svelte';
import SwitchControlDocs from '../SwitchControl.mdx';
import SwitchControlView from './SwitchControlView.svelte';
import TextControlDocs from '../TextControl.mdx';
import TextControlView from './TextControlView.svelte';
import TextInputDocs from '../TextInput.mdx';
import TextInputView from './TextInputView.svelte';

export default {
    title: 'controls (v3)'
};

const lorem = `<em>William Playfair</em> (22 September 1759 – 11 February 1823), commonly known as a Scottish engineer and political economist, served as a secret agent on behalf of Great Britain during its war with France. The founder of graphical methods of statistics, Playfair invented several types of diagrams: in 1786 the line, area and bar chart of economic data, and in 1801 the pie chart and circle graph, used to show part-whole relations. As secret agent, Playfair reported on the French Revolution and organized a clandestine counterfeiting operation in 1793 to collapse the French currency.`;

const options = ['red', 'blue', 'orange'].map(value => {
    return { value, label: value, id: value };
});

const moreOptions = ['red', 'blue', 'orange', 'green', 'hotpink', 'cyan', 'magenta', 'goldenrod', 'seashell4'].map(value => {
    return { value, label: value, id: value };
});

export const AlertDisplay = addStory('AlertDisplay', AlertDisplayView, AlertDisplayDocs, {});
export const DropdownControl = addStory('DropdownControl', DropdownControlView, DropdownControlDocs, { options });
export const DropdownInput = addStory('DropdownInput', DropdownInputView, DropdownInputDocs, { lorem });
export const IconButton = addStory('IconButton', IconButtonView, IconButtonDocs, {});
export const IconDisplay = addStory('IconDisplay', IconDisplayView, IconDisplayDocs, {});
export const MoreOptionsGroup = addStory('MoreOptionsGroup', MoreOptionsGroupView, MoreOptionsGroupDocs, { items: moreOptions });
export const NumberControl = addStory('NumberControl', NumberControlView, NumberControlDocs, { value: 42 });
export const NumberInput = addStory('NumberInput', NumberInputView, NumberInputDocs, { value: 42 });
export const IconButtonBar = addStory('IconButtonBar', IconButtonBarView, NumberInputDocs, { value: 42 });
export const RadioControl = addStory('RadioControl', RadioControlView, RadioControlDocs, { options });
export const SelectControl = addStory('SelectControl', SelectControlView, SelectControlDocs, { options });
export const SnackbarDisplay = addStory('SnackbarDisplay', SnackbarDisplayView, SnackbarDisplayDocs, { lorem });
export const SwitchControl = addStory('SwitchControl', SwitchControlView, SwitchControlDocs);
export const TextControl = addStory('TextControl', TextControlView, TextControlDocs, { value: 'Lorem Ipsum' });
export const TextInput = addStory('TextInput', TextInputView, TextInputDocs, { value: 'Hello world' });

function addStory(name, view, docs, args) {
    const Template = ({ ...args }) => ({
        Component: view,
        props: args
    });

    const Story = Template.bind({});

    Story.args = args;
    Story.storyName = name;
    Story.parameters = { docs: { page: docs } };

    return Story;
}
