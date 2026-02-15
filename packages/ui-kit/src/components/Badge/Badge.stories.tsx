import type {Meta, StoryObj} from '@storybook/react';

import {Badge} from './Badge';

const meta: Meta<typeof Badge> = {
  component: Badge,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
    controls: {expanded: true},
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Example: Story = {args: {variant: 'warning', children: 'Статус'}};
