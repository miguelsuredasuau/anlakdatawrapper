import type { Metadata } from '@datawrapper/shared/chartTypes';

export type Visualization = {
    namespace?: string;
    'svelte-workflow': 'chart' | 'locator-map';
    __controlsHash: string | undefined;
    __plugin: string;
    __styleHash: string;
    __title: string;
    __visHash: string | undefined;
    ariaLabel?: string;
    axes?: unknown; // TODO Describe axes.
    controls?: { js: string };
    defaultMetadata?: Metadata;
    dependencies: unknown; // TODO Describe dependencies.
    height?: number;
    icon: string;
    id: string;
    includeInWorkflow?: boolean;
    libraries: string[];
    options?: unknown; // TODO Describe options.
    order?: number;
    script?: string;
    supportsFitHeight?: boolean;
    title: string;
    workflow: 'chart' | 'map' | 'table' | 'locator-map';
};
