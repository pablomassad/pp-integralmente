import React from 'react'


export default function DetalleFactura()
{

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <input type='file' ref={inputFile} style={{display: 'none'}} onChange={onChangeFile} />
        </Form>
    )
}