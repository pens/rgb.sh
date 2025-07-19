---
title: On Organizing a Photo Catalog
excerpt: Learnings from finally getting my photo catalog cleaned up
tags: photo project
---

Having just left my most recent job, I've finally had the time to clear out my seemingly-perpetual backlog of projects and chores.
Of all of these tasks, perhaps none has been more of a stressor, nor as long-lasting, as that of managing my digital photos and videos.

This project really had two components: the first was to just get my photo catalog into a "good" state; the second was to actually develop a process that would keep the catalog organized over time, *and* make it easy for me to use the photos as I needed (i.e. sharing them).
This is really an evolution of my efforts getting started with Linux for photography ([Photo Organization](/blog/organization/)), on top of my experiences digitizing family media ([Digitization: Part 1](/blog/digitization/) and [Digitization: Part 2](/blog/digitization-2/)).

I am not much of a fan of online recipes that start by telling an author's entire life story.
As such, I am going to get right into the insights from this project that might be useful for others.
I will blather on about what I went through over the course of this project afterwards.

## General Suggestions

1. Buy a [Network-Attached Storage](https://en.wikipedia.org/wiki/Network-attached_storage) (NAS).

   If I were doing things all over again, my first photography-related purchase after a camera and lens would be a NAS.
   A NAS provides the following:

   a. *Redundancy*: Pretty much every NAS ever is a multi-drive system, with hard drives in a [RAID](https://en.wikipedia.org/wiki/RAID) configuration.
      This means that if a hard drive fails, you don't lose your data.

   b. *Automatic backups*: While redundancy is important, it doesn't protect your data in the case of a full system loss (e.g. from fire or theft).
      Backups are a necessity to ensure that your library isn't lost in these circumstances.
      A NAS makes it easy to set up automatic backups to whichever cloud provider you prefer.

   c. *Multi-device access*: By storing your catalog on an always-available network location, you can access it from multiple devices (e.g. a laptop and a desktop).

2. Put in place a backup process.

   You need to make sure you have a plan for backing up your photo library *before* you have a hardware failure (unless you really don't care about losing photos).

   I use both automatic backups from my NAS to the cloud, and manual backups to USB hard drives stored off-site (i.e. not in my apartment).
   In both cases, I version the backups.
   This means I can restore older versions of files just in case I corrupt something and don't notice it for a long time.

3. Treat your Digital Asset Manager (DAM) as the source of truth for metadata.

   It's a good idea to choose what constitutes the "truth", as metadata can be inconsistent across storage locations.
   The metadata in an image may not match what is in its sidecar file, nor what is in your photo software database.
   Using your DAM's database seems to be the easiest and most flexible, as they are not constrained to a particular standard.
   It's still a good idea to keep all metadata in sync with the ground truth source, though, and it's required if you use multiple different applications with their own databases.

4. Store metadata in sidecars.

   While you can write metadata straight to image files most of the time, I suggest using XMP sidecars instead.
   This lets you treat the image as an immutable artifact, from which you can recover the original metadata.
   It also avoids the *very slim* chance of corruption from writing straight to formats that aren't well documented, as is sometimes the case with raw formats.

5. Name by date and time.

   Most photo management programs have built-in ways to rename your photos based on their date & time of capture.
   By doing so, you get easy sorting of images from your file manager, consistency across images taken by different cameras and mostly unique names.

6. Split your catalog / library into multiple root directories.

   I prefer to split images taken on my cameras into three categories: digital, film and phone.
   I further separate out images from friends and family, screenshots and scans of old family photos into other directories.
   I do this to cut down on the total number of images within each subdirectory tree, and to add more separation between types of images that are generally treated differently (e.g. raw images vs screenshots).

7. Keep your videos alongside your photos.

   If you're like me, you don't tend to take a ton of video.
   Most of mine are from Live Photos, so I prefer to just keep them in my photo catalog alongside my images.
   This is simpler than having a separate video catalog, as I just about never edit video.

## Background Knowledge

While I wish this weren't the case, properly managing a photo catalog on Linux does require a little bit deeper understanding of how things work under the hood than when using the Adobe suite on macOS or Windows.
Although, that's really how everything is on Linux, isn't it?

### Metadata

Metadata is *data, about data*.
For photos and videos, that is any data beyond that representing the actual image, such as the date of capture.

**The core of photo organization is the management of metadata.**

The real goal of this organization project was to be able to quickly and easily find any specific photo.
Almost always, this is formulated as a query over information stored in photo metadata (e.g. "find all photos from my 2022 trip to Seattle", "find all photos containing a family member", or "find all photos rated three stars or higher").

#### Standards

There are three main standards for storing photo metadata.
These are [Exif](https://en.wikipedia.org/wiki/Exif), [IPTC IIM](https://en.wikipedia.org/wiki/IPTC_Information_Interchange_Model) and [XMP](https://en.wikipedia.org/wiki/Extensible_Metadata_Platform).
It's not important to understand the *how* of each of these standards, but you'll want to be aware of their existence.

Just treat each as a collection of name-value pairs, where "name" will be a standardized field describing a piece of data and the format in which "value" will be stored (e.g. Exif's `DateTimeOriginal` will hold a value representing the original date a photo was taken).
You can also generally ignore IPTC IIM, as its been superseded by XMP, but I mention it because it will still be referenced in many settings pages as *IPTC*.

#### Sidecar Files

Metadata need not be stored in the same file as the actual image data.
When split out into a second file referencing the first, we call it a *sidecar file* or *sidecar*.

Following Adobe's lead, the standard for metadata sidecars is the *XMP sidecar*, which (surprise!) stores solely XMP metadata.
You can generally assume that any discussion of sidecars in the photo context is about XMP sidecars specifically.

XMP sidecars are favored when working with raw files.
As these formats are manufacturer-specific, there is a higher risk that modifying the metadata in the image file directly could cause corruption.
Additionally, they enable image formats that don't support metadata to have metadata associated, and allow you to treat the original image as an "archive" from which you can always restore any original metadata from.

I have settled on only writing to XMP sidecars, and not images of any format, in my own catalog.
I'm not so much concerned about the corruption aspect, as I've actually been writing my metadata straight to raw files up until only recently.
For me, it comes down to my preference of treating images as immutable artifacts, and the ability to restore their original metadata if I mess up something later (e.g. an incorrect clock adjustment).

Do note that this means you need to keep your sidecars with your photos if you ever move them around.
A lost sidecar is (potentially) lost metadata.

#### Takeaways

If the above was too much text, here are the important points:

1. Given a single photo, a piece of information may be held in one or more of the above formats, and may even be able to be stored in multiple locations within a given format.
2. Two programs may read and write metadata to different locations across formats, and in different orders.
   In combination with the above point, this means that **metadata *can* become inconsistent**.
3. Not every file type can store *all* of the above formats, and some cannot store *any*.
4. Not every image file format is well documented, nor is every image's metadata actually following a format correctly.
   It is theoretically possible to corrupt an image when writing metadata to it, although the chance seems generally slim these days.

### Miscellaneous Notes

#### Live Photos

Apple's *Live Photos* are actually just an image paired with a video.
Both the image and video have a tag containing matching unique identifiers.
This allows Apple's photo software to pair them up into a Live Photo.

To access this value, ExifTool provides the `ContentIdentifier` tag.

#### Timestamps

Metadata formats store a number of different timestamps, in varying formats.
Most often, these are representing one of three different times: the time that a photo was taken (i.e. the actuation of the shutter), the time that a photo written to a memory card or digitized, and the time of the most recent modification to the image.

Working with ExifTool, these will be `DateTimeOriginal`, `CreateDate` and `ModifyDate`, but you may see other equivalent names (e.g. `DateTimeDigitized`).

## Data Flow

I'd suggest starting any photo organization effort with diagrams modelling the flow of images and their metadata through the target process.
This includes both *where* the data lives at different stages in its life, and *how* it moves across physical locations.
While this suggestion likely stems from my tendency towards visual learning, I find that diagrams help to highlight issues or inefficiencies in the overall process.

### Images

{% include svg src="blog/linux-photo/image_flow.svg" cap="The flow of images through my setup. Solid lines indicate manual transfers, while dotted are automated. My NAS is the source of truth." %}

The above diagram shows how images move from my phone and dedicated cameras to my actual photo catalog, and then back out to be shared.
My catalog lives on my NAS, which allows me to work from either my desktop or laptop.
DropBox and the USB hard drive copies are for cloud and off-site backups, respectively.


### Metadata

{% include svg src="blog/linux-photo/metadata_flow.svg" cap="The flow of metadata through my setup. Edges show when metadata is synchronized between sources.<br>digiKam is my choice of digital asset manager, and darktable is what I use for editing RAW photos. The digiKam database is the source of truth for metadata." %}

The above diagram would differ across different photo programs and their configurations, but is likely to be of a similar structure in any case.
Ultimately, most programs are going to have their own internal databases to store metadata on top of that located in files and their sidecars.
Knowing when databases and files on disk each get updated (or even *if*) is important, else you can end up overwriting your work as I accidentally did.

Note how this diagram explains why you should generally not try to run two different photo programs on the same catalog concurrently.
This is an easy way to desynchronize the databases relative to one another.

### iCloud

As I use an iPhone with Linux computers, I haven't found an automated way to synchronize my photos to or from iCloud.
Instead, I just manually download images from and upload back to the [iCloud Photos website](https://www.icloud.com/photos/) every once-in-a-while.
I keep a record of the most recent transfer data so as to avoid duplicates.
This is annoying, but works okay.

At the very least iCloud does correctly read my added metadata, so I can search based on my tags (e.g. for a trip to Croatia).

#### Cloud Services as Your Primary

For most people, the easiest way to manage all of your photos from Linux is actually to just use a cloud service like iCloud or Google Photos.
I would strongly recommend this if you don't own any cameras beside your phone or tablet, as they are super easy to use, manage redundancy and backups (although you should still have your own!) for you, and making sharing a simple action from your phone.

However, if you have any "dedicated" cameras, I'd avoid this route.
I'm not aware of any cloud services with good (or really, any) capabilities around editing RAW images, and the costs to store terabytes of images and video in the cloud can add up.
I find its much harder to sort through photos in these services in more complex ways, which makes it difficult to manage a growing catalog.

### Backups

Redundancy and backups are not the same thing.
You **need** backups, and *want* redundancy.
One single disaster can invalidate whatever amount of redundancy you have.

#### Automated

I have my NAS configured to automatically back up my entire library to DropBox every night.
Backups are versioned, with the ability to restore files as old as one year.
On top of this, I've scheduled a weekly "quick" integrity check and a twice-yearly "full" integrity check.

How to do this will vary based on which NAS you use, but any NAS should have an easy way to set up the same automated system.

#### Manual

On top of my NAS's cloud backups, I keep off-site backups on portable hard drives.
These store not only my photo catalog, but other important file backups too (e.g. DropBox), at multiple different points in time.
This way, if I accidentally mess up part of my photo catalog, and don't notice until a couple of backups later, I can still pull the known-good copies of images from these older backups.

This isn't necessary on top of the cloud backups, but it shouldn't come as a surprise that someone using Linux would also want backups they have complete ownership over.
I think of the cloud backups as the "real" backups, while the hard drives are merely the "insurance policy".

Being unencrypted (as of today), they provide a way for friends or family to get access to my catalog in case I ever become *unavailable to decrypt* other copies.

### Sharing

Most often, I just apply darktable's default style settings to match that of my camera and then export the images.
If the export will be public, I'll use ExifTool to strip all metadata from the image, otherwise I rely on darktable to filter out my custom tags.
I like to use a shared DropBox folder per export which I share.

I plan on migrating to [immich](https://immich.app/) soon based on positive feedback from others and the fact it is self-hosted.
I've liked using it as the person being shared with, however I've not yet gotten to use it as the one sharing.

## Recommended Tools & Configurations

### Digital Asset Management: digiKam

I found [digiKam](https://www.digikam.org/) to be my preferred choice of DAM.
It's relatively easy to use, while having pretty much every possible feature I could want for organizing my images.

Check out the [digiKam documentation](https://docs.digikam.org/en/index.html) for more info.

#### Putting digiKam on Your NAS

1. Add a directory on your NAS containing your photos, and make it available over the network.
2. Install MySQL or MariaDB support on your NAS.
   I'd recommend also figuring out how you can back this database up to the cloud automatically.
3. Follow digiKam's [MySQL Remote Server instructions](https://docs.digikam.org/en/setup_application/database_settings.html#the-mysql-remote-server) to create and connect to a new database on your NAS from your PC.
4. Mount your shared catalog folder on your PC.
5. Add the catalog to "Collections on Network Shares" following digiKam's [Setup Root Album Folders](https://docs.digikam.org/en/setup_application/collections_settings.html#setup-root-album-folders).
   Make sure to read the section on [Network Shares Specificity](https://docs.digikam.org/en/setup_application/collections_settings.html#the-network-shares-specificity) if working from multiple PCs.

#### Recommended Settings

- Metadata
  - Behavior
    - Write This Information to the Metadata
      - *all*: ☑
    - Reading and Writing Metadata
      - Use lazy synchronization: ☑
      - Update file modification timestamp when files are modified: ☑
      - Rescan file when files are modified: ☑
  - Sidecars
    - Read from sidecar files: ☑
    - Write to sidecar files: ☑
      - "Write to XMP sidecar only"
  - Advanced
    - Tags
      - Read all metadata for tags: ☑

The bulk of these settings are to ensure that changes made in digiKam are picked up by other software like darktable, and vice versa.

I suggest lazy synchronization with a networked catalog, as performance suffers without.
Just note that this means changes don't immediately propagate, and instead are either written on exit or a manual sync.

See digiKam's [Metadata Settings documentation](https://docs.digikam.org/en/setup_application/metadata_settings.html) for more details.

### Editing: darktable

For editing, I prefer to use [darktable](https://www.darktable.org/).

While digiKam has raw image editing support, and darktable DAM features, I find that I prefer to use both in conjunction.
This trades off the ease of working with one program for the better capabilities provided by the pair.
When I want to edit an image, it's easy enough to send it from digiKam to darktable via digiKam's context menu.

Relatively recently, darktable added what is *to me* the single most important feature: [camera style presets](https://www.darktable.org/2024/12/howto-in-5.0/).
These let you automatically apply the necessary settings to a raw image to match what it looks like in the JPEG preview.
I'm not great at editing raw photos, so having a reasonably good starting place makes the process so much faster.
This also lets me avoid editing the 90% of photos that I just want to quickly export after a trip with friends, where it's more about the memory than the artistry.

{% include note txt="You should not run both digiKam and darktable at the same time, as edits will generally not propagate between until each program reloads metadata from disk." %}

#### Recommended Settings

- storage
  - XMP sidecar files
    - look for updated XMP files on startup: ☑

This setting is important if you plan to keep images loaded into the darktable database, but modify them in digiKam (or elsewhere).
However, I still generally delete all images from darktable once I'm done editing them.

See darktable's [settings documentation](https://docs.darktable.org/usermanual/development/en/preferences-settings/) for more detail.

### Metadata Management: ExifTool

While you can get by without using [ExifTool](https://exiftool.org/), I recommend learning the basics of it anyway.
ExifTool is the gold standard for metadata inspection and manipulation.
Many of my metadata-related issues were resolved with a simple, one-line ExifTool command.

I recommend reading through the following as needed:

- [ExifTool's documentation](https://exiftool.org/exiftool_pod.html)
- [Working with sidecars](https://exiftool.org/metafiles.html)
- [Common mistakes](https://exiftool.org/mistakes.html)
- [FAQ](https://exiftool.org/faq.html)
- [MWG Composite Tags](https://exiftool.org/TagNames/MWG.html)
- [Geotagging with ExifTool](https://exiftool.org/geotag.html)

#### Flags

My go-to ExifTool command for inspecting metadata looks like the following:

```sh
exiftool -a -G0:1 -s image.jpg
```

This shows tags with duplicate names (`-a`), lists them with their groups (`-G0:1`, e.g. XMP) and shows their tag name rather than their friendly name (`-s`).

## Story Time: The Process of Organizing My Catalog

Now that I've gotten all the useful information out of the way, I can talk through the process.
While it wasn't exactly linear, it roughly followed the below order.

### Part 1: Manual Work

#### Deduplication

The first step in my cleanup process was deduplicating images via digiKam's [Find Duplicates](https://docs.digikam.org/fr/maintenance_tools/maintenance_duplicates.html) tool.
I'd ended up with a number of copies of the same images for whatever reason, so this helped to clear them out.

#### Deleting Bad / Unwanted Photos

Perhaps the largest single effort in this process was deleting images.
While it took a ton of time to scan through my catalog, repeatedly, and remove images, it would save later effort that didn't need to be wasted on unwanted shots.
I ended up deleting around ten thousand images from my collections.
The vast majority of these were just bad shots: too dark, bright, out-of-focus or just terribly composed.

#### Adjusting Date & Time

Next I used digiKam's [Time Adjust](https://docs.digikam.org/fr/post_processing/time_adjust.html) to fix incorrect times.
Most of my needed adjustments were correcting the time of photos taken in a different timezone than the camera was set to.
The vast majority of fixes could be applied in bulk on a per-trip or per-day basis.

#### Setting GPS Location

Likewise, I used digiKam's [Geolocation Editor](https://docs.digikam.org/en/geolocation_editor/geoeditor_overview.html) to assign every photo GPS coordinates.
I didn't bother to get this perfect; I just want images to show up in the rough area in which they were taken if they don't already have GPS info.
This was down to the nearest city, or in some cases, the state/province.

#### Face Detection

Yet again, digiKam provided just the tool needed with [Detect and Recognize Faces](https://docs.digikam.org/en/maintenance_tools/maintenance_faces.html).
This works in two stages: first, you detect faces in your catalog; second, you assign a name to each face with digiKam adds to the image metadata as a label and a region of interest.
Once you've labelled a good number of images, you can run the detection again to get automatic suggestions of who each face is.
I found this to generally be pretty accurate, and make labelling faces much faster.

#### Labelling

The last step in manual cleanup work was to manually add others tags / labels I wanted in my image metadata, to make future searches easier.
I use labels to help filter my images "conceptually", in ways that aren't quite available via the standard metadata tags.

I use a number of different tags, but the main ones of interest are:

- *Events*

  These are chronologically sorted tags of the format *YYMMDD EventName*, which I use for pretty much any event---no matter how small.
  I nest these hierarchically, based on how I view an event fitting into other larger events or even life stages.
  As my catalog is primarily photos I've taken or from trips I've been on, it is easiest for me to think of photos as fitting into a timeline of my own life.

- *Projects*

  Projects are chronological based on the date of the first image.
  Each project tag collects all photos related to something I made or built, even if pretty insignificant.
  Ignoring *Events*, the bulk of my images are either of a project or a one-off shot relevant to only a single person.

- *People*

  These tags are created via digiKam's facial recognition tool.

#### Attribution

I populated the Creator tag in order to make it easier to identify which photos I had actually taken far in the future, when I can no longer remember.
My current camera is configured to set the Creator and Copyright tags to my name, but that was not the case for many existing shots.
Nor was every photo taken by my camera actually taken by me, and vice versa.
As such, I had to do a manual sweep through my catalog to populate or change this field.

Note that digiKam can search for images *without* the Creator tag set, making it easy to figure out which still need the tag set.

#### Camera Make, Model & Lens

Lastly, I've tried to fill out the camera Make and Model tags, as well as lens metadata, to the best of my ability.
This isn't always easy with film shots, but I'm not seeking perfection here anyway.

### Part 2: How I Erased A Bunch of My Work

As I touched on earlier talking about the flow of metadata, I managed to somehow erase a ton of the manual work I had done in cleaning up my catalog's metadata.
I performed a manual synchronization between the digiKam database and the on-disk image metadata, synchronizing *to* the digiKam database rather than *from*.
Why did I do this?
In retrospect, I don't have a good answer other than assuming that all of my work had already been written out when it wasn't.

Long story short, be very careful if you choose to force a synchronization and *really* understand what you're doing and why.
I ended up having to spend many more hours redoing work.
I can't tell you how mad I was at myself.

### Part 3: Automating Cleanup

Somehow, accidentally erasing all of my manual tagging work was *not* the largest waste of time in this project.
That prize goes to the [yak-shave](https://en.wiktionary.org/wiki/yak_shaving) that was developing a custom tool to automate the management of my catalog.

[Catalog 1A](https://github.com/pens/catalog_1a) is the result of many hours of reading about metadata, fiddling with ExifTool and much trial-and-error in trying to programmatically keep my photos organized the way I'd like.
All said and done I can't say it was worth it, but it was at least a fun project and a great way to learn Rust.

The goals of Catalog 1A were two-fold:

1. Get my existing catalog in (as-close-to) ideal shape as possible.

   This meant that all metadata was filled out as expected, duplicates erased, files named correctly, etc.
   In other words, I wanted my catalog to reach a good *steady state*.

2. Enforce that all new media added to the catalog met the standards I'd set.

   Given goal 1, this meant that I would run all of the same checks on new media, and only add it to the catalog if they passed.
   While as many fixes are automated as possible, forcing myself to correct any other metadata issues at import time means that the workload is smaller, but more frequent.
   I find this much easier to handle than procrastinating on the work and doing larger passes later (as I'd already done numerous times in the course of this larger effort).

#### Safety

I wanted to make sure that I didn't end up damaging my catalog.
To do so, I did the following:

1. I relied solely on ExifTool to do all modifications, as it has proven itself very reliable.
2. I ended up building out extensive unit tests to feel more comfortable that Catalog 1A would not accidentally eat my work (as I'd done to myself so many times).
3. I never actually deleted any image or XMP sidecar, and instead "deleted" items are moved to a `.trash` subdirectory.

Paired with my cloud backups and off-site backups to portable hard drives, I feel that Catalog 1A is not able to do any kind of irreversible damage to my catalog.

I did chose to write Catalog 1A in Rust, but only for practice with the language.
The type of safety Rust provides does not have a huge impact on the safety I'm concerned with here.

#### Successful Automations

Catalog 1A did the following:

1. Deletion of leftover files.

   This was both leftover XMP sidecars from images that had been deleted, as well as the video portions of Apple's Live Photos for which I'd deleted the corresponding images.

2. Deduplication of Live Photos.

   Somehow I had ended up with multiple copies of Live Photos of different formats.
   By setting up a priority order based on file format and file size, I was able to automatically clear out all of the duplicates.

3. Metadata synchronization.

   Before I'd given up on writing metadata straight to media files (opting to use only XMP sidecars), I had Catalog 1A synchronize the metadata between the sidecars and media files, as well as Live Photo images and videos, in order to avoid conflicting metadata.

4. File renaming.

   All files were automatically renamed and place in a folder based on the date and time of capture.
   Extensions were set based on ExifTool's reported media format.
   This fixed videos files for which I'd set the wrong extension (*.mp4* vs *.mov*) and made it easier to sort through files in a file browser.

These were actually all successful, and were useful upon first run to cull a number of files from my catalog and enforce naming consistency.
Later runs, unsurprisingly, did not add anything more.

#### ExifTool Bug Fix

I have to give a special shout-out to ExifTool's developer Phil Harvey.
During the course of this project, I managed to hit a crash in ExifTool when [writing to Canon's CR3 format](https://github.com/exiftool/exiftool/issues/228).
Phil was super responsive and immediately fixed the bug in ExifTool.

#### Knowing When to Abort

I abandoned implementation of the following, realizing that the time spent to develop Catalog 1A further was not worth it.
My remaining "TODO" list:

1. Automatic Copyright tag population
2. Geolocation (City, State, Country, etc. tags from GPS)
3. Timezone from GPS
4. Renaming by UTC time
5. Clearing empty tags

These were mostly implemented, including unit tests.
However, I hit a point where I realized the diminishing returns of continuing to develop Catalog 1A were just not worth it.
Much of the above is really no longer important to getting my catalog organized, falling into the category of solutions in search of problems.

I'd spent a couple of weeks completely rewriting the entire program and hitting well over one hundred unit tests.
It's *really* hard to change course in this situation.
I had to force myself to step back and think big picture: *why* was I continuing to develop this program and *how* did it contribute to the original goal?
I didn't have good answers, so it was time to archive the repo and move on.

### Part 4: Wrap-Up

In closing, I think I got a little (or really, very) sidetracked trying to overbuild a system when I could have made do with existing tools within digiKam.
Even so, it was a lot of fun and a great way to get better at Rust, so I don't really feel like it was a waste of time.

As far as the larger effort goes, I feel a great deal of relief.
It's much more fun to take photos again, knowing that I can quickly and easily get them into my system and then shared with friends and family.