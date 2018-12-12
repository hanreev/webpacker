import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor'
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials'
import UploadAdapterPlugin from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter'
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat'
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold'
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic'
import UnderlinePlugin from '@ckeditor/ckeditor5-basic-styles/src/underline'
import StrikethroughPlugin from '@ckeditor/ckeditor5-basic-styles/src/strikethrough'
import SuperscriptPlugin from '@ckeditor/ckeditor5-basic-styles/src/superscript'
import SubscriptPlugin from '@ckeditor/ckeditor5-basic-styles/src/subscript'
import CodePlugin from '@ckeditor/ckeditor5-basic-styles/src/code'
import BlockQuotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote'
import EasyImagePlugin from '@ckeditor/ckeditor5-easy-image/src/easyimage'
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading'
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image'
import ImageCaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption'
import ImageStylePlugin from '@ckeditor/ckeditor5-image/src/imagestyle'
import ImageToolbarPlugin from '@ckeditor/ckeditor5-image/src/imagetoolbar'
import ImageUploadPlugin from '@ckeditor/ckeditor5-image/src/imageupload'
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link'
import ListPlugin from '@ckeditor/ckeditor5-list/src/list'
import MediaEmbedPlugin from '@ckeditor/ckeditor5-media-embed/src/mediaembed'
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph'
import PasteFromOfficePlugin from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice'
import TablePlugin from '@ckeditor/ckeditor5-table/src/table'
import TableToolbarPlugin from '@ckeditor/ckeditor5-table/src/tabletoolbar'
import FontSizePlugin from '@ckeditor/ckeditor5-font/src/fontsize'

ClassicEditor.builtinPlugins = [
  EssentialsPlugin,
  UploadAdapterPlugin,
  AutoformatPlugin,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  SuperscriptPlugin,
  SubscriptPlugin,
  CodePlugin,
  BlockQuotePlugin,
  EasyImagePlugin,
  HeadingPlugin,
  ImagePlugin,
  ImageCaptionPlugin,
  ImageStylePlugin,
  ImageToolbarPlugin,
  ImageUploadPlugin,
  LinkPlugin,
  ListPlugin,
  MediaEmbedPlugin,
  ParagraphPlugin,
  PasteFromOfficePlugin,
  TablePlugin,
  TableToolbarPlugin,
  FontSizePlugin,
]

ClassicEditor.defaultConfig = {
  toolbar: {
    items: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      '|',
      'strikethrough',
      'superscript',
      'subscript',
      'code',
      '|',
      'fontsize',
      '|',
      'link',
      'bulletedList',
      'numberedList',
      'imageUpload',
      'blockQuote',
      'inserttable',
      'mediaEmbed',
      'undo',
      'redo',
    ]
  },
  image: {
    styles: ['full', 'side', 'alignLeft', 'alignCenter', 'alignRight'],
    toolbar: [
      'imageStyle:full',
      'imageStyle:side',
      'imageStyle:alignLeft',
      'imageStyle:alignCenter',
      'imageStyle:alignRight',
      '|',
      'imageTextAlternative'
    ]
  },
  mediaEmbed: {
    previewsInData: true,
  },
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells'
    ]
  },
  language: 'en'
}

ClassicEditor.create(document.getElementById('editor'))
  .then(editor => console.log(editor))
  .catch(error => console.log(error))
