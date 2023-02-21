import React from 'react'

import './Error.css'

function InputError({isValid, message}) {
    if(!isValid) {
        return <></>
    }
    else {
      return (
          <div className="validity-error callout bottom">
          {message}
          </div>
  
        )
    }
}

export default InputError


