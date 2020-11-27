import "./styles.css";
import { Dropbox } from "dropbox";
import { fetch } from "unfetch";



const dbx = new Dropbox({
  accessToken:
    "sl.AmRfBLJzlIuQdm27OMIDnhYZ7hhnRTmIztJi1O_J28ds29S-UslLwWyb_py6oaxkUL_m6jy7c7szN56bSxcd6bofQ2HziR_wAYwgao0lv8OQFodtRv52kJf7wpNCyQLkaNjhejs"
    ,
    fetch
  });

const filesListItem = document.querySelector(".js-file-list");

const state = {
  files: []
}

const init = () => {
  dbx.filesListFolder({
    path: "",
    limit: 20
  })
  .then(response => {
    updateFiles(response.result.entries)
  });
}

const updateFiles = files => {
  state.files = [...state.files, ...files]
  renderFiles()
  getThumbnails(files)
}

const renderFiles = () => {
  filesListItem.innerHTML = state.files.sort((a,b) => {
    // sort alphabetically, folders first
    if ((a['.tag'] === 'folder' || b['.tag'] === 'folder')
      && !(a['.tag'] === b['.tag'])) {
      return a['.tag'] === 'folder' ? -1 : 1
    } else {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
    }
  }).map(file => {
    const type = file['.tag']
    let thumbnail
    if(type === 'file'){
      thumbnail = file.thumbnail
      ? `data:image/jpeg;base64, ${file.thumbnail}`
      : `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUiPjxwYXRoIGQ9Ik0xMyAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOXoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIxMyAyIDEzIDkgMjAgOSI+PC9wb2x5bGluZT48L3N2Zz4=`
    }
    else{
      thumbnail = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZvbGRlciI+PHBhdGggZD0iTTIyIDE5YTIgMiAwIDAgMS0yIDJINGEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmg1bDIgM2g5YTIgMiAwIDAgMSAyIDJ6Ij48L3BhdGg+PC9zdmc+`
    }
    return `
      <li class="dbx-list-item" ${type} >
      <img class="dbx-thumb" src="${thumbnail}" />
      ${file.name}
      </li>
    `
  })
  //pass a join with an empty string to remove the ' seperator and make sure it returns
  //only a string
  .join('')
}

const getThumbnails = files => {
  const paths = files.filter(file => file['tag'] === 'file')
  .map(file => ({
    path: file.path_lower ,
    size: 'w32h32'
  }))

  dbx.filesGetThumbnailBatch({
    entries: paths
  }).then(response => {
    console.log(response)
  })
}


init()


