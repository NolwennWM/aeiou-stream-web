"use strict";

import { LayoutMenu } from "./LayoutMenu.js";
import { VideoHandler } from "./VideoHandler.js";

const layoutMenu = new LayoutMenu();
layoutMenu.setLayoutEvent();
(new VideoHandler(layoutMenu)).displayStreamers();