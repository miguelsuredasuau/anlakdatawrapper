import type { Metadata } from '@datawrapper/shared/chartTypes';
export declare type Visualization = {
    namespace?: string;
    'svelte-workflow': 'chart' | 'locator-map';
    __controlsHash: string | undefined;
    __plugin: string;
    __styleHash: string;
    __title: string;
    __visHash: string | undefined;
    ariaLabel?: string;
    axes?: unknown;
    controls?: {
        js: string;
    };
    defaultMetadata?: Metadata;
    dependencies: unknown;
    height?: number;
    icon: string;
    id: string;
    includeInWorkflow?: boolean;
    libraries: string[];
    options?: unknown;
    order?: number;
    script?: string;
    supportsFitHeight?: boolean;
    title: string;
    workflow: 'chart' | 'map' | 'table' | 'locator-map';
};
