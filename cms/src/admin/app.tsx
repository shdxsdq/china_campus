import {
  defaultHtmlPreset,
  defaultTheme,
  setPluginConfig,
  type PluginConfig,
  type Preset,
} from '@_sh/strapi-plugin-ckeditor';

const campusArticlePreset: Preset = {
  ...defaultHtmlPreset,
  name: 'campusArticle',
  description:
    '支持按光标插图、媒体库选图和正文所见即所得的校园新闻编辑器',
  editorConfig: {
    ...defaultHtmlPreset.editorConfig,
    placeholder: '在这里输入正文。光标放哪里，图片就插入到哪里。',
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'link',
      '|',
      'bulletedList',
      'numberedList',
      'blockquote',
      'insertTable',
      '|',
      'insertImage',
      'strapiMediaLib',
      '|',
      'undo',
      'redo',
    ],
  },
};

const pluginConfig: PluginConfig = {
  presets: [campusArticlePreset],
  theme: {
    ...defaultTheme,
    additional: `
      .ck {
        --ck-editor-max-width: 100%;
        --ck-editor-min-height: 520px;
        --ck-editor-max-height: none;
      }

      .ck.ck-content {
        line-height: 1.9;
        font-size: 16px;
      }

      .ck.ck-content .image {
        margin: 1.5rem auto;
      }

      .ck.ck-content .image img {
        border-radius: 12px;
      }
    `,
  },
};

export default {
  register() {
    setPluginConfig(pluginConfig);
  },
};
