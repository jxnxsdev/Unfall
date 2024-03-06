export let current_pulls: string[] = [];
export async function add_pull(pull: string) {
    current_pulls.push(pull);
}
export async function remove_pull(pull: string) {
    current_pulls = current_pulls.filter(p => p !== pull);
}

export let last_pull_unix: number = 0;
export async function set_last_pull_unix(unix: number) {
    last_pull_unix = unix;
}