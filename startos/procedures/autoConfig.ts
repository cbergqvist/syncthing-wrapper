import { ConfigSpec } from './config/spec'
import { WrapperData } from '../wrapperData'
import { Manifest } from '../manifest'
import { setupAutoConfig } from '@start9labs/start-sdk/lib/autoconfig/setupAutoConfig'
import * as F from 'filebrowser/startos/wrapperData'

/**
 * In this function, you establish rules for auto configuring service dependencies
 *
 */
export const autoConfig = setupAutoConfig<
  WrapperData,
  ConfigSpec,
  Manifest,
  {
    filebrowser: F.WrapperData
  }
>({
  filebrowser: async ({}) => {},
})