from collections import deque

def minTimeToRottenOranges(N, M, grid):
    dir = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    q = deque()
    count_new = 0

    for i in range(N):
        for j in range(M):
            if grid[i][j] == 2:
                q.append((i, j, 0)) 
            elif grid[i][j] == 1:
                count_new += 1

    maxi_t = 0

    while q:
        x, y, t = q.popleft()
        maxi_t = max(maxi_t, t)

        for dx, dy in dir:
            nx, ny = x + dx, y + dy
            if 0 <= nx < N and 0 <= ny < M and grid[nx][ny] == 1:
                grid[nx][ny] = 2 
                count_new -= 1
                q.append((nx, ny, t + 1))

    return maxi_t if count_new == 0 else -1


# Input handling (keep as per your template)
N = int(input())
M = int(input())
grid = [list(map(int, input().split())) for i in range(N)]

out_ = minTimeToRottenOranges(N, M, grid)
print(out_)
