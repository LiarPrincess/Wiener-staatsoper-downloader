Really simple program to download streams from [Vienna state opera](https://www.staatsoperlive.com).

# Instructions

1. Find the play you like. As an example we will use "Die Walküre" by Richard Wagner (available [here](https://www.staatsoperlive.com/0/eba91937-2929-48f8-8cee-57ae0250d584/player)).
2. Download video. You can use following command:
```
ffmpeg -i "https://live.performa.intio.tv/media/a31f0b09-0a82-4265-a52a-13e90ab61ffe/master-allsubs.m3u8" -c copy -bsf:a aac_adtstoasc "Die Walküre.mp4"
```
3. On the webpage select subtitles.
4. Copy the url of one of the subtitle chunks, for example:
```
https://live.performa.intio.tv/media/a31f0b09-0a82-4265-a52a-13e90ab61ffe/subs-eng-513.vtt
```
5. Paste this url in `app.ts`.
6. Run program.

This program will download all of the subtitle chunks and the merge them into `.srt` file.

# FAQ

Question 1:
```
TURANDOT
Stranger, listen!
“In the gloomy night
an iridescent phantom flies.
It spreads its wings and rises
over infinite, black humanity!
Everyone invokes it,
everyone implores it!
But the phantom disappears at dawn
to be reborn in the heart!
And every night it’s born
and every day it dies!

THE UNKNOWN PRINCE
Yes! It’s reborn!
It’s reborn and, exulting,
it carries me with it, Turandot;
it is Hope!
```

Question 2:
```
TURANDOT
Yes! Hope which always deludes!
“It flickers like flame,
and is not flame!
Sometimes it rages!
It’s feverish, impetuous, burning!
But idleness changes it to languor!
If you’re defeated or lost,
it grows cold!
If you dream of winning, if flames!
Its voice is faint, but you listen;
it gleams as bright as the sunset!”

(...)

THE UNKNOWN PRINCE
Yes, Princess!
It flames and languishes, too,
if you look at me,
in my veins:
it is Blood!
```

Question 3:
```
TURANDOT (points to the crowd, to the guards)
Lash those wretches!
(She comes down the stair. She bends over the
Unknown Prince, who falls to his knees.)
“Ice that sets you on fire
and from your fire is more frosty!
White and dark!
If she sets you free,
she makes you a slave!
If she accepts you as a slave,
she makes you a King!”
Come, stranger!
You’re pale with fright!
And you know you are lost!
Come, stranger, what is the frost
that gives off fire?

THE UNKNOWN PRINCE (leaps to his feet, exclaiming)
My victory now
has given you to me!
My fire will thaw you:
Turandot!
```
