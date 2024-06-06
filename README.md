# xaro

A web-focused media library app initially created to learn more about Node + backend development. 

It's a bit chaotic... Still a lot to be fixed up, but that's ok. That's the cost of writing code to solve solutions that probably already have dozens of libraries solving them. So why would I do that? Simple: To learn.

## Features

Features listed below are either partially or fully implemented. There's plenty of work to still be done, along with formal testing.

### User Accounts

User accounts were added because I thought "why not?" The only downside is I keep forgetting to properly implement non-admin access authorisation. Whoops...

### Web Client

Imagine a shoe that's been partially polished. That's not the web client. It's also not a shoe that's been fully polished, nor is it a shoe that's never been polished. It's more like a shoe that's got chunks missing, with mismatched patches applied over some of them, and wherever there is some shoe, it may or may not be polished. That's the best way to describe the web client in its current state.

There's some notably fun stuff - a few nice transitions, ratings + favouriting UI, a content multi-select mode the currently doesn't do anything except look nice and work quite smoothly.

Oh, did I mention... **INFINITE SCROLLING**. 

Mostly just needs a cleanup and some additional navigation. And then some.

### Plugin System

Custom plugins can be integrated via a dedicated plugin system, which allows additional functionalities to be incorporated with minimal friction. Currently, the plugin module definitions and implementations are limited, but do provide a glimpse into how they can be used and improved.
