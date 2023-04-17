const apiPath = `https://cloud.mobify.com/api/projects/elf-pwa`
const authToken = `vx4PbNp7SJDKZdpw0b5WNGpE6U7VysdAmlyJlQJYlRk`

export default async (req, res) => {
  const endpoint = req.query.endpoint?.join('/')
  const url = `${apiPath}/${endpoint}/`

  const result = await fetch(url, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${authToken}`,
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
