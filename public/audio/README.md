# Audio assets

Drop royalty-free / CC0 audio files into this folder following the structure below. The game
will auto-detect and play them. If files are missing, the game falls back to procedural
synthesis (Web Audio API oscillators) so the audio system always works.

## Music — looping ambient tracks

Place at `/public/audio/music/`:

| File         | When it plays                         | Suggested style                 |
|--------------|---------------------------------------|---------------------------------|
| `menu.ogg`   | Main menu, scenarios, settings, start | Calm, foreboding, ~60-120s loop |
| `calm.ogg`   | Early game, low infection             | Pensive, low strings, ~60-120s  |
| `tense.ogg`  | Mid game, spreading                   | Anxious, faster pulse, ~60-120s |
| `collapse.ogg` | Late game, collapses, defeat        | Heavy, dissonant, ~60-120s      |

Format: OGG/Vorbis recommended (smaller; native browser support). MP3 also works.

## SFX — one-shot sound effects

Place at `/public/audio/sfx/`:

| File             | Trigger                                   |
|------------------|-------------------------------------------|
| `click.ogg`      | Button clicks                             |
| `hover.ogg`      | Button hover (optional)                   |
| `detection.ogg`  | First detection event                     |
| `mutation.ogg`   | Mutation purchased                        |
| `intervene.ogg`  | Intervention deployed                     |
| `cure-stage.ogg` | Cure stage completes / breakthrough       |
| `collapse.ogg`   | Country healthcare collapse / burning     |
| `victory.ogg`    | Game won sting                            |
| `defeat.ogg`     | Game lost sting                           |

## Where to find royalty-free audio

- [Pixabay Music](https://pixabay.com/music/) - CC0 / royalty-free
- [Free Music Archive](https://freemusicarchive.org/) - mixed licences, filter for CC0/CC-BY
- [Freesound.org](https://freesound.org/) - SFX, CC0/CC-BY
- [Kevin MacLeod](https://incompetech.com/) - CC-BY ambient/cinematic

Always check the licence and add attribution to `CREDITS.md` as needed.

## License attribution

Track and SFX credits should be added to `CREDITS.md` in this folder.
