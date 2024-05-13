export default async (req, res) => {
  const endpoint = req.query.endpoint?.join('/')
  const url = `${req.query.path}/${endpoint}/`

  const result = await fetch(url, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${req.query.token}`,
      'Content-Type': 'application/json',
    },
    ...(req.body && { body: req.body }),
  }).then((r) => r.json())

  res.json(result)
}

export const config = {
  api: {
    bodyParser: true,
  },
}
