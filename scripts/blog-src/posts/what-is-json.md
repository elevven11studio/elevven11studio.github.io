---
title: What Is JSON? A Plain-English Guide for Beginners
description: What JSON is, how to read it, the six kinds of value it allows, and how to fix the errors that stop it working, explained without jargon.
date: 2026-11-23
product: tools
---
If you have ever exported data from an app, set up a website plugin or looked at a settings file, you have probably seen something like this:

`{"name": "Ada's Kitchen", "open": true, "tables": 12}`

That is JSON. It stands for JavaScript Object Notation, and it is a way of writing data as plain text so that people and programs can both read it. Despite the name, you do not need to know JavaScript to use it.

## Why JSON is everywhere

Programs need to pass data to each other. A payment provider tells your website a payment went through. A booking app sends a list of appointments to a phone. An export button gives you your customer list.

JSON became the common format for this because it is short, readable and strict. Strict is the important part. There is only one correct way to write it, so any program can read what another program wrote.

## How to read JSON

JSON is built from two shapes.

An **object** is a set of labelled values inside curly braces. Each label is called a key. A colon separates the key from its value, and a comma separates each pair:

`{"city": "Abuja", "staff": 4}`

Read it as: the city is Abuja, and staff is 4.

An **array** is a list inside square brackets, separated by commas:

`["Monday", "Tuesday", "Friday"]`

The two can be nested inside each other as deep as needed. A shop's record might hold a list of opening days and a smaller object for the manager:

`{"shop": "Ada's Kitchen", "open": true, "days": ["Monday", "Friday"], "manager": {"name": "Ada", "phone": null}}`

A formatter writes the same data with each key on its own indented line, which is much easier to read:

```
{
  "shop": "Ada's Kitchen",
  "open": true,
  "days": ["Monday", "Friday"],
  "manager": {
    "name": "Ada",
    "phone": null
  }
}
```

The indentation is only there for people. A program reads the same data whether it is spread over many lines or squashed onto one.

## The six kinds of value

Every value in JSON is one of these:

| Type | Example | Notes |
|---|---|---|
| String | "Abuja" | Text, always in double quotes |
| Number | 12 or 4.5 | No quotes, no currency signs or commas |
| Boolean | true or false | Lowercase, no quotes |
| Null | null | Means empty or unknown |
| Object | {"a": 1} | Keys must be strings in double quotes |
| Array | [1, 2, 3] | A list of any values |

That is the whole language. There are no dates, no functions and no comments. A date is usually stored as a string, such as "2026-11-23".

## Common errors and how to fix them

Because JSON is strict, one wrong character breaks the whole thing. Most errors come from writing it by hand or copying it from code. Here are the usual causes.

### A trailing comma

`{"a": 1, "b": 2,}`

The comma after the last item is not allowed. Remove it.

### Single quotes

`{'name': 'Ada'}`

JSON only accepts double quotes, around both keys and text values. Write `{"name": "Ada"}`.

### Keys without quotes

`{name: "Ada"}`

This works in JavaScript but not in JSON. Every key needs double quotes.

### Comments

JSON does not allow `//` or `/* */` comments. If you need a note, add it as a normal key, such as `"note": "staff count updated monthly"`.

### A missing comma

`{"a": 1 "b": 2}`

Each pair needs a comma between it and the next. This often happens when you add a new line and forget the comma on the line above.

### A line break inside a string

Text values cannot run over two lines. Write a line break as `\n` inside the string instead.

### Very large numbers

Whole numbers above 9,007,199,254,740,991 can lose precision in JavaScript and get rounded. Long ID numbers and account references are safer stored as strings.

## How to find the error quickly

Error messages from apps often say something unhelpful like "unexpected token". The fastest fix is a validator that tells you the exact line and column. Go to that spot and look just before it. The real mistake is usually a comma or quote on the same line or the one above.

Formatting helps too. When JSON arrives as one long line, indenting it puts each key on its own line, and a missing bracket or comma becomes easy to see.

## A free JSON formatter

Our [JSON formatter](/tools/json-formatter/) checks your JSON as you type and shows the line and column of any error. Format indents it with 2 spaces, 4 spaces or tabs, and Minify squashes it back to one line. You can sort keys alphabetically, copy the result or download it.

It runs entirely in your browser, so JSON containing API keys, tokens or customer data never leaves your device. That matters more than it sounds: pasting private data into a website that sends it to a server is a common way for it to leak.

If you work with website files, you may also like [how to check what a website is built with](/blog/how-to-check-what-a-website-is-built-with/).
