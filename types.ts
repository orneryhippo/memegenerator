export enum LoadingState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  ERROR = 'ERROR'
}

export interface MemeTemplate {
  id: string;
  url: string;
  name: string;
}

export interface AnalysisResult {
  captions: string[];
}
