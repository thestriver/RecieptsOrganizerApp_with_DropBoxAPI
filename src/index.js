import "./styles.css";
import { Dropbox } from "dropbox";
import { fetch } from "unfetch";
// import { axios } from "axios"

const dbx = new Dropbox({
  accessToken:
    "hw07qLQd72EAAAAAAAAAAQJj6984KmaabgRlOovbIWVF23Kks2slnA7pfYlK-Kxu",
  fetch
});

const filesListItem = document.querySelector(".js-file-list");
const loadingElem = document.querySelector(".js-loading");
const rootPathForm = document.querySelector('.js-root-path__form')
const rootPathInput = document.querySelector('.js-root-path__input')
const organizeBtn = document.querySelector('.js-organize-btn')

//move to paths/folders
rootPathForm.addEventListener('submit', event => {
  event.preventDefault(); 
  state.rootPath = rootPathInput.value ===  '/' ? '' : rootPathInput.value.toLowerCase()
  reset()
})

//move files to paths/folders on click
organizeBtn.addEventListener('click', async event => {
  const originalMsg = event.target.innerHTML
  event.target.disabled = true
  event.target.innerHTML = 'Working...'
  await moveFilesToDatedFolders()
  event.target.disabled = false
   event.target.innerHTML = originalMsg
  reset()
})

const reset = () => {
  state.files = []
  loadingElem.classList.remove("hidden");
  init()
}


const state = {
  files: [],
  rootPath: ''
};

// const init = () => {
//   dbx
//     .filesListFolder({
//       path: "",
//       limit: 20
//     })
//     .then((response) => {
//       updateFiles(response.result.entries);
//     });
// };
//using async/await
const init = async () => {
  const response = await dbx.filesListFolder({
    path: state.rootPath,
    limit: 10
  });
  updateFiles(response.result.entries);

  //checking to see if there are more files
  if (response.result.has_more) {
    loadingElem.classList.remove("hidden");
    await getMoreFiles(response.result.cursor, (more) =>
      updateFiles(more.result.entries)
    );
    loadingElem.classList.add("hidden");
  } else {
    loadingElem.classList.add("hidden");
  }
};

const getMoreFiles = async (cursor, cb) => {
  const res = await dbx.filesListFolderContinue({ cursor });
  if (cb) cb(res);
  if (res.has_more) {
    await getMoreFiles(res.cursor, cb);
  }
};

const updateFiles = (files) => {
  state.files = [...state.files, ...files];
  renderFiles();
  getThumbnails(files);
};

const renderFiles = () => {
  filesListItem.innerHTML = state.files
    .sort((a, b) => {
      // sort alphabetically, folders first
      if (
        (a[".tag"] === "folder" || b[".tag"] === "folder") &&
        !(a[".tag"] === b[".tag"])
      ) {
        return a[".tag"] === "folder" ? -1 : 1;
      } else {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
      }
    })
    .map((file) => {
      const type = file[".tag"];
      let thumbnail;
      if (type === "file") {
        thumbnail = file.thumbnail
          ? `data:image/jpeg;base64, ${file.thumbnail}`
          : `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUiPjxwYXRoIGQ9Ik0xMyAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOXoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIxMyAyIDEzIDkgMjAgOSI+PC9wb2x5bGluZT48L3N2Zz4=`;
      } else {
        thumbnail = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZvbGRlciI+PHBhdGggZD0iTTIyIDE5YTIgMiAwIDAgMS0yIDJINGEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmg1bDIgM2g5YTIgMiAwIDAgMSAyIDJ6Ij48L3BhdGg+PC9zdmc+`;
      }
      return `
      <li class="dbx-list-item" ${type} >
      <img class="dbx-thumb" src="${thumbnail}" />
      ${file.name}
      </li>
    `;
    })
    //pass a join with an empty string to remove the ' seperator and make sure it returns
    //only a string
    .join("");
};

// const getThumbnails = (files) => {
//   const paths = files
//     .filter((file) => file[".tag"] === "file")
//     .map((file) => ({
//       path: file.path_lower,
//       size: "w32h32"
//     }));
//   dbx
//     .filesGetThumbnailBatch({
//       entries: paths
//     })
//     .then((response) => {
//       console.log(response.result);
//       // make a copy of state.files
//       const newStateFiles = [...state.files];
//       // loop through the file objects returned from dbx
//       response.result.entries.forEach((file) => {
//         // figure out the index of the file we need to update
//         let indexToUpdate = state.files.findIndex(
//           (stateFile) => file.metadata.path_lower === stateFile.path_lower
//         );
//         // put a .thumbnail property on the corresponding file
//         newStateFiles[indexToUpdate].thumbnail = file.thumbnail;
//       });
//       state.files = newStateFiles;
//       renderFiles();
//     });
// };

//using async/await
const getThumbnails = async (files) => {
  const paths = files
    .filter((file) => file[".tag"] === "file")
    .map((file) => ({
      path: file.path_lower,
      size: "w32h32"
    }));

  const response = await dbx.filesGetThumbnailBatch({
    entries: paths
  });
  // console.log(response.result);
  // make a copy of state.files
  const newStateFiles = [...state.files];
  // loop through the file objects returned from dbx
  response.result.entries.forEach((file) => {
    // figure out the index of the file we need to update
    let indexToUpdate = state.files.findIndex(
      (stateFile) => file.metadata.path_lower === stateFile.path_lower
    );
    // put a .thumbnail property on the corresponding file
    newStateFiles[indexToUpdate].thumbnail = file.thumbnail;

    state.files = newStateFiles;
    renderFiles();
  });
};

const moveFilesToDatedFolders = async () => {
  const entries = state.files
    .filter(file => file['.tag'] === 'file')
    .map(file => {
      const date = new Date(file.client_modified);
      return {
        from_path: file.path_lower,
        to_path: `${state.rootPath}/${date.getFullYear()}/${date.getUTCMonth() + 1}/${file.name}`
      }
    })
  try {
    let response = await dbx.filesMoveBatchV2({ entries })
    const { async_job_id } = response
    if (async_job_id) {
      do {
        response = await dbx.filesMoveBatchCheckV2({ async_job_id })
        console.log(response)
      } while (response['.tag'] === 'in_progress')
    }
  }
  catch(err){
    console.error(err)
  }
}


init();
