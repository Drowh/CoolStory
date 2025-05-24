import { library, IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import {
  faRobot,
  faUser,
  faUserCircle,
  faCog,
  faPalette,
  faQuestionCircle,
  faSignInAlt,
  faPlus,
  faChevronLeft,
  faChevronRight,
  faStar,
  faEllipsisH,
  faEdit,
  faTrashAlt,
  faChevronDown,
  faChevronUp,
  faPaperclip,
  faMicrophone,
  faPaperPlane,
  faDownload,
  faComments,
  faSearch,
  faImage,
  faFile,
  faTimes,
  faBars,
  faFolder,
  faFolderPlus,
  faTags,
  faMicrophoneSlash,
  faSignOut,
  faRightFromBracket,
  faRightToBracket,
  faCheckCircle,
  faExclamationCircle,
  faTimesCircle,
  faBrain,
  faSpinner,
  faSun,
  faMoon,
  faLightbulb,
  faCode,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";

type IconCategory = "navigation" | "actions" | "status" | "media" | "system";

interface IconConfig {
  icon: IconDefinition;
  category: IconCategory;
}

const iconConfigs: Record<string, IconConfig> = {
  chevronLeft: { icon: faChevronLeft, category: "navigation" },
  chevronRight: { icon: faChevronRight, category: "navigation" },
  chevronDown: { icon: faChevronDown, category: "navigation" },
  chevronUp: { icon: faChevronUp, category: "navigation" },
  bars: { icon: faBars, category: "navigation" },
  times: { icon: faTimes, category: "navigation" },

  plus: { icon: faPlus, category: "actions" },
  edit: { icon: faEdit, category: "actions" },
  trash: { icon: faTrashAlt, category: "actions" },
  download: { icon: faDownload, category: "actions" },
  search: { icon: faSearch, category: "actions" },
  copy: { icon: faCopy, category: "actions" },
  paperclip: { icon: faPaperclip, category: "actions" },
  microphone: { icon: faMicrophone, category: "actions" },
  paperPlane: { icon: faPaperPlane, category: "actions" },
  folderPlus: { icon: faFolderPlus, category: "actions" },

  star: { icon: faStar, category: "status" },
  starRegular: { icon: faStarRegular, category: "status" },
  checkCircle: { icon: faCheckCircle, category: "status" },
  exclamationCircle: { icon: faExclamationCircle, category: "status" },
  timesCircle: { icon: faTimesCircle, category: "status" },
  spinner: { icon: faSpinner, category: "status" },

  image: { icon: faImage, category: "media" },
  file: { icon: faFile, category: "media" },
  folder: { icon: faFolder, category: "media" },
  comments: { icon: faComments, category: "media" },

  robot: { icon: faRobot, category: "system" },
  user: { icon: faUser, category: "system" },
  userCircle: { icon: faUserCircle, category: "system" },
  cog: { icon: faCog, category: "system" },
  palette: { icon: faPalette, category: "system" },
  questionCircle: { icon: faQuestionCircle, category: "system" },
  signInAlt: { icon: faSignInAlt, category: "system" },
  ellipsisH: { icon: faEllipsisH, category: "system" },
  tags: { icon: faTags, category: "system" },
  microphoneSlash: { icon: faMicrophoneSlash, category: "system" },
  signOut: { icon: faSignOut, category: "system" },
  rightFromBracket: { icon: faRightFromBracket, category: "system" },
  rightToBracket: { icon: faRightToBracket, category: "system" },
  brain: { icon: faBrain, category: "system" },
  sun: { icon: faSun, category: "system" },
  moon: { icon: faMoon, category: "system" },
  lightbulb: { icon: faLightbulb, category: "system" },
  code: { icon: faCode, category: "system" },
};

Object.values(iconConfigs).forEach(({ icon }) => {
  library.add(icon);
});

export { iconConfigs };
export type { IconCategory, IconConfig };
export default library;
