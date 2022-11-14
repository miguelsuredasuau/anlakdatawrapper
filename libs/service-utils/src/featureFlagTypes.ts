export type FeatureFlag = {
    id: string;
    default: boolean;
    type: 'switch';
    title: {
        key: string;
        scope: string;
    };
    group: 'annotate' | 'footer' | 'layout';
};
