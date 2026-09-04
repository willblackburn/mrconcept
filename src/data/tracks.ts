export type Track = {
  id: string
  title: string
  artist: string
  audioSrc: string
}

export const tracks: Track[] = [
  {
    id: 'track-01',
    title: 'Prodigy Planet Asia',
    artist: 'Mr Concept',
    audioSrc: '/audio/mrconcept_prodigy_planetasia.mp3',
  },
  {
    id: 'track-02',
    title: 'Ra Ruggedman',
    artist: 'Mr Concept',
    audioSrc: '/audio/mrconcept_raruggedman.mp3',
  },
]
