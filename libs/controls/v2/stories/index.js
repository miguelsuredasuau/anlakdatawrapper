/* eslint-env node */
// import fs from 'fs';
import { storiesOf } from '@storybook/svelte';
import { withKnobs, select } from '@storybook/addon-knobs';

import './static/vendor/bootstrap/css/bootstrap.css';
import './static/vendor/bootstrap/css/bootstrap-responsive.css';
import './static/css/datawrapper.css';
import './static/vendor/font-awesome/css/font-awesome.min.css';
import './static/vendor/iconicfont/css/iconmonstr-iconic-font.min.css';

import countries from './static/data/countries.json';

import AlertDisplayView from './AlertDisplayView.html';
import AlertDisplayDocs from '../AlertDisplay.md';
import AnnotationEditorView from './AnnotationEditorView.html';
import AnnotationEditorDocs from '../AnnotationEditor.md';
import ChartDescriptionView from './ChartDescriptionView.html';
import ChartDescriptionDocs from '../editor/ChartDescription.md';
import CheckboxControlView from './CheckboxControlView.html';
import CheckboxControlDocs from '../CheckboxControl.md';
import ColorControlView from './ColorControlView.html';
import ColorControlDocs from '../ColorControl.md';
import ColorCategoryInputView from './ColorCategoryInputView.html';
import ColorCategoryInputDocs from '../ColorCategoryInput.md';
import ColorPickerInputView from './ColorPickerInputView.html';
import ColorPickerInputPaletteConfigView from './ColorPickerInputPaletteConfigView.html';
import ColorPickerInputPaletteGroupsView from './ColorPickerInputPaletteGroupsView.html';
import ColorPickerInputDocs from '../ColorPickerInput.md';
import ColorScaleEditorView from './ColorScaleEditorView.html';
import ColorScaleEditorDocs from '../ColorScaleEditor.md';
import ConfirmationModalView from './ConfirmationModalView.html';
import ConfirmationModalDocs from '../ConfirmationModal.md';
import CustomAxisRangeControlView from './CustomAxisRangeControlView.html';
import CustomAxisRangeControlDocs from '../CustomAxisRangeControl.md';
import CustomFormatControlView from './CustomFormatControlView.html';
import CustomFormatControlDocs from '../CustomFormatControl.md';
import DropdownControlView from './DropdownControlView.html';
import DropdownDocs from '../DropdownControl.md';
import DropdownInputView from './DropdownInputView.html';
import DropdownInputDocs from '../DropdownInput.md';
import DropdownListInputView from './DropdownListInputView.html';
import DropdownListInputDocs from '../DropdownListInput.md';
import FeatureIntroductionDisplayDocs from '../FeatureIntroductionDisplay.md';
import FeatureIntroductionDisplayView from './FeatureIntroductionDisplayView.html';
import FormBlockView from './FormBlockView.html';
import FormBlockDocs from '../FormBlock.md';
import FontStyleControlView from './FontStyleControlView.html';
import FontStyleControlDocs from '../FontStyleControl.md';
import GradientDisplayView from './GradientDisplayView.html';
import GradientDisplayDocs from '../GradientDisplay.md';
import GradientEditorView from './GradientEditorView.html';
import GradientEditorDocs from '../GradientEditor.md';
import GroupView from './GroupView.html';
import GroupDocs from '../Group.md';
import HelpDisplayView from './HelpDisplayView.html';
import HelpDisplayDocs from '../HelpDisplay.md';
import HistogramDisplayView from './HistogramDisplayView.html';
import HistogramDisplayDocs from '../HistogramDisplay.md';
import IconDisplayView from './IconDisplayView.html';
import IconDisplayDocs from '../IconDisplay.md';
import LegendEditorView from './LegendEditorView.html';
import LegendEditorDocs from '../LegendEditor.md';
import ListInputView from './ListInputView.html';
import ListInputDocs from '../ListInput.md';
import MoreOptionsGroupView from './MoreOptionsGroupView.html';
import MoreOptionsGroupDocs from '../MoreOptionsGroup.md';
import NumberControlView from './NumberControlView.html';
import NumberControlDocs from '../NumberControl.md';
import NumberInputView from './NumberInputView.html';
import NumberInputDocs from '../NumberInput.md';
import OverlaysEditorView from './OverlaysEditorView.html';
import OverlaysEditorDocs from '../OverlaysEditor.md';
import PaginationView from './PaginationView.html';
import PaginationDocs from '../Pagination.md';
import PublishButtonControlView from './PublishButtonControlView.html';
import PublishButtonControlDocs from '../publish/PublishButtonControl.md';
import ProgressBarView from './ProgressBarView.html';
import ProgressBarDocs from '../ProgressBar.md';
import ProgressSpinnerDisplayView from './ProgressSpinnerDisplayView.html';
import ProgressSpinnerDisplayDocs from '../ProgressSpinnerDisplay.md';
import RadioControlView from './RadioControlView.html';
import RadioControlDocs from '../RadioControl.md';
import ResetInputView from './ResetInputView.html';
import ResetInputDocs from '../ResetInput.md';
import SelectControlView from './SelectControlView.html';
import SelectControlDocs from '../SelectControl.md';
import SelectAxisColumnControlView from './SelectAxisColumnControlView.html';
import SelectAxisColumnControlDocs from '../SelectAxisColumnControl.md';
import SelectButtonsControlView from './SelectButtonsControlView.html';
import SelectButtonsControlDocs from '../SelectButtonsControl.md';
import SelectHighlightsEditorView from './SelectHighlightsEditorView.html';
import SelectHighlightsControlDocs from '../SelectHighlightsEditor.md';
import SwitchControlView from './SwitchControlView.html';
import SwitchControlDocs from '../SwitchControl.md';
import TableDisplayView from './TableDisplayView.html';
import TableDisplayDocs from '../TableDisplay.md';
import TemplateEditorView from './TemplateEditorView.html';
import TemplateEditorDocs from '../TemplateEditor.md';
import TextControlView from './TextControlView.html';
import TextControlDocs from '../TextControl.md';
import TextInputView from './TextInputView.html';
import TextInputDocs from '../TextInput.md';
import TextAreaControlView from './TextAreaControlView.html';
import TextAreaControlDocs from '../TextAreaControl.md';
import TextAreaInputView from './TextAreaInputView.html';
import TextAreaInputDocs from '../TextAreaInput.md';
import TooltipEditorView from './TooltipEditorView.html';
import TooltipEditorDocs from '../TooltipEditor.md';
import TypeAheadInputView from './TypeAheadInputView.html';
import TypeAheadInputDocs from '../TypeAheadInput.md';

const lorem = `<em>William Playfair</em> (22 September 1759 – 11 February 1823), commonly known as a Scottish engineer and political economist, served as a secret agent on behalf of Great Britain during its war with France. The founder of graphical methods of statistics, Playfair invented several types of diagrams: in 1786 the line, area and bar chart of economic data, and in 1801 the pie chart and circle graph, used to show part-whole relations. As secret agent, Playfair reported on the French Revolution and organized a clandestine counterfeiting operation in 1793 to collapse the French currency.`;

const options = ['red', 'blue', 'orange'].map(value => {
    return { value, label: value, id: value };
});

const moreOptions = [
    'red',
    'blue',
    'orange',
    'green',
    'hotpink',
    'cyan',
    'magenta',
    'goldenrod',
    'seashell4'
].map(value => {
    return { value, label: value, id: value };
});

const book = storiesOf('controls (v2)', module).addDecorator(withKnobs);

addStory('AlertDisplay', AlertDisplayDocs, () => ({
    Component: AlertDisplayView
}));

addStory('AnnotationEditor', AnnotationEditorDocs, () => ({
    Component: AnnotationEditorView
}));

addStory('ChartDescription', ChartDescriptionDocs, () => ({
    Component: ChartDescriptionView
}));

addStory('CheckboxControl', CheckboxControlDocs, () => ({
    Component: CheckboxControlView
}));

addStory('ColorControl', ColorControlDocs, () => ({
    Component: ColorControlView
}));

addStory('ColorPickerInput', ColorPickerInputDocs, () => ({
    Component: ColorPickerInputView,
    data: { options }
}));

addStory('+ PaletteConfig', ColorPickerInputDocs, () => ({
    Component: ColorPickerInputPaletteConfigView,
    data: { options }
}));

addStory('+ PaletteGroups', ColorPickerInputDocs, () => ({
    Component: ColorPickerInputPaletteGroupsView,
    data: { options }
}));

addStory('ColorScaleEditor', ColorScaleEditorDocs, () => ({
    Component: ColorScaleEditorView,
    data: { options }
}));

addStory('ColorCategoryInput', ColorCategoryInputDocs, () => ({
    Component: ColorCategoryInputView,
    data: { options }
}));

addStory('ConfirmationModal', ConfirmationModalDocs, () => ({
    Component: ConfirmationModalView,
    data: { options }
}));

addStory('CustomAxisRangeControl', CustomAxisRangeControlDocs, () => ({
    Component: CustomAxisRangeControlView
}));

addStory('CustomFormatControl', CustomFormatControlDocs, () => ({
    Component: CustomFormatControlView,
    data: { options }
}));

addStory('DropdownControl', DropdownDocs, () => ({
    Component: DropdownControlView,
    data: { options }
}));

addStory('DropdownInput', DropdownInputDocs, () => ({
    Component: DropdownInputView,
    data: { lorem }
}));

addStory('DropdownListInput', DropdownListInputDocs, () => ({
    Component: DropdownListInputView,
    data: { options }
}));

addStory('FeatureIntroductionDisplay', FeatureIntroductionDisplayDocs, () => ({
    Component: FeatureIntroductionDisplayView
}));

addStory('FormBlock', FormBlockDocs, () => ({
    Component: FormBlockView,
    data: { options }
}));

addStory('FontStyleControl', FontStyleControlDocs, () => ({
    Component: FontStyleControlView,
    data: { options }
}));

addStory('GradientDisplay', GradientDisplayDocs, () => ({
    Component: GradientDisplayView,
    data: { options }
}));

addStory('GradientEditor', GradientEditorDocs, () => ({
    Component: GradientEditorView,
    data: { options }
}));

addStory('Group', GroupDocs, () => ({
    Component: GroupView,
    data: { lorem }
}));

addStory('HelpDisplay', HelpDisplayDocs, () => ({
    Component: HelpDisplayView,
    data: { options }
}));

addStory('HistogramDisplay', HistogramDisplayDocs, () => ({
    Component: HistogramDisplayView,
    data: { options }
}));

addStory('IconDisplay', IconDisplayDocs, () => ({
    Component: IconDisplayView,
    data: { options }
}));

addStory('LegendEditor', LegendEditorDocs, () => ({
    Component: LegendEditorView,
    data: {}
}));

addStory('ListInput', ListInputDocs, () => ({
    Component: ListInputView,
    data: { items: moreOptions }
}));

addStory('MoreOptionsGroup', MoreOptionsGroupDocs, () => ({
    Component: MoreOptionsGroupView,
    data: { value: 42, items: moreOptions }
}));

addStory('NumberControl', NumberControlDocs, () => ({
    Component: NumberControlView,
    data: { value: 42 }
}));

addStory('NumberInput', NumberInputDocs, () => ({
    Component: NumberInputView,
    data: { value: 42 }
}));

addStory('OverlaysEditorView', OverlaysEditorDocs, () => ({
    Component: OverlaysEditorView,
    data: {}
}));

addStory('RadioControl', RadioControlDocs, () => ({
    Component: RadioControlView,
    data: { options }
}));

addStory('ResetInput', ResetInputDocs, () => ({
    Component: ResetInputView,
    data: { value: 42, value2: -10, value3: 150 }
}));

addStory('Pagination', PaginationDocs, () => ({
    Component: PaginationView,
    data: { options }
}));

addStory('PublishButtonControl', PublishButtonControlDocs, () => ({
    Component: PublishButtonControlView,
    data: {}
}));

addStory('ProgressBar', ProgressBarDocs, () => ({
    Component: ProgressBarView
}));

addStory('ProgressSpinnerDisplay', ProgressSpinnerDisplayDocs, () => ({
    Component: ProgressSpinnerDisplayView,
    data: { options }
}));

addStory('SelectControl', SelectControlDocs, () => ({
    Component: SelectControlView,
    data: { options: moreOptions }
}));

addStory('SelectAxisColumnControl', SelectAxisColumnControlDocs, () => ({
    Component: SelectAxisColumnControlView
}));

addStory('SelectButtonsControl', SelectButtonsControlDocs, () => ({
    Component: SelectButtonsControlView,
    data: { options }
}));

addStory('SelectHighlightsEditor', SelectHighlightsControlDocs, () => ({
    Component: SelectHighlightsEditorView
}));

addStory('SwitchControl', SwitchControlDocs, () => ({
    Component: SwitchControlView,
    data: { initial: true }
}));

addStory('TableDisplay', TableDisplayDocs, () => ({
    Component: TableDisplayView,
    data: { options }
}));

addStory('TemplateEditor', TemplateEditorDocs, () => ({
    Component: TemplateEditorView,
    data: { options }
}));

addStory('TextControl', TextControlDocs, () => ({
    Component: TextControlView,
    data: { value: 'Lorem Ipsum' }
}));

addStory('TextInput', TextInputDocs, () => ({
    Component: TextInputView,
    data: { value: 'Hello world' }
}));

addStory('TextAreaControl', TextAreaControlDocs, () => ({
    Component: TextAreaControlView,
    data: { value: 'Lorem Ipsum' }
}));

addStory('TextAreaInput', TextAreaInputDocs, () => ({
    Component: TextAreaInputView,
    data: { value: lorem }
}));

addStory('TooltipEditor', TooltipEditorDocs, () => ({
    Component: TooltipEditorView,
    data: {}
}));

addStory('TypeAheadInput', TypeAheadInputDocs, () => ({
    Component: TypeAheadInputView,
    data: { items: countries }
}));

function addStory(panelId, docs, render) {
    if (!render) {
        render = docs;
        docs = 'Create a `' + panelId + '.md` file to add a readme.';
    }

    docs = docs.replace(
        /\[([A-Z][^\]]+)\]/g,
        (m, g) => `[${g}](?path=/info/controls-v2--${g.toLowerCase()})`
    );

    book.add(
        panelId,
        function () {
            const language = select('Language', { German: 'de', English: 'en' }, 'en');
            global.setLanguage(language);
            return render(language);
        },
        { notes: docs }
    );
}
